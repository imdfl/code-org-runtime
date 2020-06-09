import * as express from "express";
import * as fs from "fs";
import * as fsPath from "path";
import { Application } from "express";
import { NextFunction, Request, Response } from "express";
import * as NodeUtils from "util";
import { INOServerUser } from "models/user.model";
import { CodeUtils } from "../utils/code-utils";
import { IAppRouters, IAppContext, INOAPI } from "./interfaces";
import { BaseAPI } from "./base-api";

export class ScriptAPI extends BaseAPI {

	public install(appContext: IAppContext, routers: IAppRouters): void {
		super.install(appContext, routers);

		const r = routers.scriptRouter;
		r.get("/:user/:name", this.serveScript.bind(this));
		r.get("/raw/:user/:name", this.serveRawScript.bind(this));

		const api = routers.clientRouter; // this._apiRouter = express.Router();
		api.get("/users", this.listUsers.bind(this));
		api.get("/list/:user", this.listScripts.bind(this));
		api.get("/script/:user/:name", this.loadScriptData.bind(this));
		api.post("/render", this.renderOnce.bind(this));
	}


	private async listScripts(req: Request, res: Response, next: NextFunction): Promise<any> {
		const user = await this.userFromRequest(req);
		if (!user) {
			return this.sendObjectResponse(res, "user not found", null);
		}
		var recs = await this.listUserFolder(user, "js");

		return this.sendObjectResponse(res, null, recs);
	}

	private async listUsers(req: Request, res: Response, next: NextFunction): Promise<any> {

		const users = await NodeUtils.promisify(fs.readdir)(this.appContext.paths.scripts);
		const lstat = NodeUtils.promisify(fs.lstat);
		const ret = new Array<Pick<INOServerUser, "name" | "id" | "clientPath">>();
		for (let name of users) {
			const stat = await lstat(fsPath.join(this.appContext.paths.scripts, name));
			if (stat && stat.isDirectory()) {
				ret.push({
					name: this.makeUserName(name),
					id: name,
					clientPath: `/scripts/${name}}`
				});
			}
		}
		return this.sendObjectResponse(res, null, ret);
	}

	private async loadScriptData(req: Request, res: Response, next: NextFunction): Promise<any> {
		const user = await this.userFromRequest(req);
		if (!user) {
			return this.sendObjectResponse(res, "user not found", null);
		}
		const scriptName = req.params["name"];

		const script = await this.loadScript(user, scriptName);
		if (!script) {
			return res.status(404).send(`${scriptName} not found`).end();
		}
		if (!script.content.raw) {
			script.content.raw = await this.loadRawScript(user, scriptName);
		}
		return this.sendObjectResponse(res, null, script)
	}

	private async renderOnce(req: Request, res: Response, next: NextFunction): Promise<any> {
		const rawScript = req.body && req.body.script;
		if (!rawScript) {
			return res.status(400).send("no script body provided").end();
		}
		var script = await this.renderScriptFromBody(rawScript);

		return this.sendScriptResponse(res, script);
	}

	private async serveScript(req: Request, res: Response, next: NextFunction): Promise<any> {
		const user = await this.userFromRequest(req);
		if (!user) {
			return this.sendObjectResponse(res, "user not found", null);
		}
		const scriptName = req.params["name"];
		var script = await this.loadScript(user, scriptName);
		if (!script) {
			return res.status(404).send(`${scriptName} not found`).end();
		}

		return this.sendScriptResponse(res, script.content.rendered);
	}

	private async serveRawScript(req: Request, res: Response, next: NextFunction): Promise<any> {
		const scriptName = req.params["name"];
		const user = await this.userFromRequest(req);
		if (!user) {
			return this.sendObjectResponse(res, "user not found", null);
		}
		var script = await this.loadRawScript(user, scriptName);
		if (!script) {
			return res.status(404).send(`${scriptName} not found`).end();
		}

		return this.sendScriptResponse(res, script);
	}

	private async loadScript(user: INOServerUser, name: string): Promise<IScriptRecord> {
		const scriptId = CodeUtils.makeScriptName(name);
		if (!user || !scriptId) {
			return null;
		}
		try {
			const ret: IScriptRecord = {
				name: name,
				id: scriptId,
				author: user.name,
				content: {
					raw: null,
					rendered: null
				},
				modification: new Date(),
				rawUrl: null,
				url: null
			};
			const fullPath = fsPath.join(user.renderPath, `${scriptId}.js`);
			ret.content.rendered = await this.readFile(fullPath);
			if (ret.content.rendered) {
				return ret;
			}
			ret.content = await this.renderScript(user, name);
			return ret;
		}
		catch (e) {
			console.error(e);
			return null;
		}
	}

	private async loadRawScript(user: INOServerUser, name: string): Promise<string> {
		name = CodeUtils.makeScriptName(name);
		if (!name) {
			return null;
		}
		const scriptPath = fsPath.join(user.path, `js/${name}.js`);
		return await this.readFile(scriptPath);

	}

	/**
	 * 
	 * @param scriptName already .js free
	 * @param renderedPath 
	 */
	private async renderScript(user: INOServerUser, scriptName: string): Promise<IScriptContent> {
		try {
			const raw = await this.loadRawScript(user, scriptName);
			if (!raw) {
				return null;
			}
			const rendered = await this.renderScriptFromBody(raw);
			// const headerPath = fsPath.join(this.appContext.paths.data, "script-header.jspart");
			// const footerPath = fsPath.join(this.appContext.paths.data, "script-footer.jspart");
			// const header = await this.readFile(headerPath);
			// const footer = await this.readFile(footerPath);
			// const rendered = [header, raw, footer].join('\n');
			await NodeUtils.promisify(fs.mkdir)(user.renderPath, { recursive: true });
			const renderedPath = fsPath.join(user.renderPath, `${CodeUtils.makeScriptName(scriptName)}.js`);
			fs.writeFile(renderedPath, rendered, (err: any) => {
				if (err) {
					console.log("fs error in write rendered", renderedPath, err);
				}
			});
			return {
				raw,
				rendered
			};
		}
		catch (e) {
			return null;
		}

	}

	/**
	 * 
	 * @param name already .js free
	 * @param renderedPath 
	 */
	private async renderScriptFromBody(body: string): Promise<string> {
		try {
			const headerPath = fsPath.join(this.appContext.paths.data, "script-header.jspart");
			const footerPath = fsPath.join(this.appContext.paths.data, "script-footer.jspart");
			const header = await this.readFile(headerPath);
			const footer = await this.readFile(footerPath);
			return [header, body, footer].join('\n');
		}
		catch (e) {
			return null;
		}
	}

	private async listUserFolder(user: INOServerUser, subFolder: string): Promise<IScriptRecord[]> {
		const url = fsPath.join(this.appContext.paths.scripts, user.id, subFolder || "");
		const fileNames = await NodeUtils.promisify(fs.readdir)(url);

		return fileNames.map(f => {
			const name = CodeUtils.makeScriptName(f);
			return {
				name: f,
				id: name,
				url: `/scripts/${user.id}/${name}`,
				rawUrl: `/scripts/raw/${user.id}/${name}`,
				author: user.name,
				modification: new Date(),
				content: {
					raw: null,
					rendered: null
				}
			};
		});
	}

}