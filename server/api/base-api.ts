import * as express from "express";
import * as fs from "fs";
import * as fsPath from "path";
import { Application } from "express";
import { NextFunction, Request, Response } from "express";
import * as NodeUtils from "util";
import { INOServerUser } from "models/user.model";
import { CodeUtils } from "../utils/code-utils";
import { IAppRouters, IAppContext, INOAPI } from "./interfaces";

export class BaseAPI implements INOAPI {
	private _appContext: IAppContext;

	/**
	 * Override to install your own api, but don't forget to call super.install
	 * @param appContext 
	 * @param routers 
	 */
	public install(appContext: IAppContext, routers: IAppRouters): void {
		this._appContext = appContext;
	}

	public get appContext() {
		return this._appContext;
	}

	protected async readFile(path: string): Promise<string> {
		try {
			const b: Buffer = await NodeUtils.promisify(fs.readFile)(path);
			return String(b);
		}
		catch (e) {
			return null;
		}
	}

	protected sendObjectResponse(res: Response, error: any, data: any) {
		return res.status(200).contentType("application/json")
			.send({
				error,
				data
			}).end();
	}

	protected sendScriptResponse(res: Response, script: string) {
		return res.status(200).contentType("application/javascript")
			.send(script).end();
	}

	protected async userFromRequest(req: Request): Promise<INOServerUser> {
		const userName = req.params.user as string;
		if (!userName) {
			return null;
		}
		const userId = this.makeUserId(userName);
		const fullPath: string = fsPath.join(this._appContext.paths.scripts, userId);
		try {
			const stat = await NodeUtils.promisify(fs.lstat)(fullPath);
			if (stat && stat.isDirectory) {
				return {
					name: userName,
					path: fullPath,
					clientPath: `/scripts/${userId}`,
					renderPath: fsPath.join(this._appContext.paths.rendered, userId),
					id: userId
				}
			}
		}
		catch (e) {
			console.error(e);
		}
		return null;
	}

	protected makeUserId(name: string): string {
		if (!name) {
			return null;
		}
		return name.trim().toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/\-\-+/g, '-')
			.replace(/[^a-z0-9_\-\.\$]+/ig, "_");
	}

	protected makeUserName(id: string): string {
		if (!id) {
			return null;
		}
		return id
			.replace(/[_\-+]+/g, ' ')
			.replace(/\s\s+/g, ' ');

	}
}