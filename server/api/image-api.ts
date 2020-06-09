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

export class ImageAPI extends BaseAPI  {
	public install(appContext: IAppContext, routers: IAppRouters): void {
		super.install(appContext, routers);
		const r = routers.scriptRouter;

		const api = routers.imagesRouter; // this._apiRouter = express.Router();
		api.get("/list/:user", this.listUserImages.bind(this));
		api.get("/:user/:name", this.loadImage.bind(this));
	}


	private async listUserImages(req: Request, res: Response, next: NextFunction): Promise<any> {
		const user = await this.userFromRequest(req);
		if (!user) {
			return this.sendObjectResponse(res, "user not found", null);
		}
		var recs = await this.listUserFolder(user, "js");

		return this.sendObjectResponse(res, null, recs);
	}

	private async loadImage(req: Request, res: Response, next: NextFunction): Promise<any> {

		// const users = await NodeUtils.promisify(fs.readdir)(this._scriptsPath);
		// const lstat = NodeUtils.promisify(fs.lstat);
		// const ret = new Array<Pick<INOServerUser, "name" | "id" | "clientPath">>();
		// for (let name of users) {
		// 	const stat = await lstat(fsPath.join(this._scriptsPath, name));
		// 	if (stat && stat.isDirectory()) {
		// 		ret.push({
		// 			name: this.makeUserName(name),
		// 			id: name,
		// 			clientPath: `/scripts/${name}}`
		// 		});
		// 	}
		// }
		// return this.sendObjectResponse(res, null, ret);
	}


}