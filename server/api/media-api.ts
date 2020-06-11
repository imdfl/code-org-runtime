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

export class MediaAPI extends BaseAPI  {
	private _defaultImagePath: string;
	private readonly fileExists: (url: fs.PathLike) => Promise<boolean>;

	constructor() {
		super();
		this.fileExists = NodeUtils.promisify(fs.exists);
	}

	public install(appContext: IAppContext, routers: IAppRouters): void {
		super.install(appContext, routers);
		this._defaultImagePath = fsPath.join(appContext.paths.sandbox, "images", "default.png");
		const api = routers.imagesRouter; // this._apiRouter = express.Router();
		api.get("/list/:user", this.listUserImages.bind(this));
		api.get("/:user/:name", this.loadImage.bind(this));
	}


	private async listUserImages(req: Request, res: Response, next: NextFunction): Promise<any> {
		const user = await this.userFromRequest(req);
		if (!user) {
			return this.sendObjectResponse(res, "user not found", null);
		}
		var recs = await this.listUserFolder(user, "images");

		return this.sendObjectResponse(res, null, recs);
	}

	private async loadImage(req: Request, res: Response, next: NextFunction): Promise<any> {

		const user = await this.userFromRequest(req);
		if (!user) {
			return this.sendObjectResponse(res, "user not found", null);
		}
		const imageId = CodeUtils.makeImageName(req.params.name);
		let imagePath = fsPath.join(user.path, "images", `${imageId}.gif`);
		let exists = await this.fileExists(imagePath);
		if (!exists) {
			imagePath = fsPath.join(user.path, "images", `${imageId}.png`);
			exists = await this.fileExists(imagePath);
	
		}
		return res.sendFile(exists? imagePath : this._defaultImagePath); 
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
	private async listUserFolder(user: INOServerUser, subFolder: string): Promise<IImageRecord[]> {
		const url = fsPath.join(this.appContext.paths.scripts, user.id, subFolder || "");
		const fileNames = await NodeUtils.promisify(fs.readdir)(url);

		return fileNames.map(f => {
			const name = CodeUtils.makeImageName(f);
			return {
				name: f,
				id: name,
				url: `/images/${user.id}/${name}`,
				author: user.name,
				modification: new Date()
			};
		});
	}



}