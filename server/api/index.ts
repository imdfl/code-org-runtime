import * as express from "express";
import * as fs from "fs";
import * as fsPath from "path";
import { ScriptAPI } from "./script-api";
import { IAppRouters, IAppContext} from "./interfaces";
import { ImageAPI } from "./image-api";

class AppRouters implements IAppRouters {
	public readonly clientRouter: express.Router;
	public readonly authorRouter: express.Router;
	public readonly scriptRouter: express.Router;
	public readonly imagesRouter: express.Router;
	constructor(app: express.Application) {
		this.authorRouter = express.Router();
		this.clientRouter = express.Router();
		this.scriptRouter = express.Router();
		this.imagesRouter = express.Router();

		app.use("/scripts", this.scriptRouter);
		app.use("/api", this.clientRouter);
		app.use("/userimages", this.imagesRouter);

	}
}

class ApiIndex {

	private routers: AppRouters;
	
	public constructor() {
	}


	public init(appContext: IAppContext): void {
		this.routers = new AppRouters(appContext.app);
		const sapi: ScriptAPI = new ScriptAPI();
		sapi.install(appContext, this.routers);
		const imgApi = new ImageAPI();
		imgApi.install(appContext, this.routers);
	}
}

let index: ApiIndex = null;
/**
 * Installs the API
 * @param app The express application
 * @param rootPath Path of the root directory of this app
 */
export const installAPI = (appContext: IAppContext) => {
	if (index !== null) {
		throw new Error("API Index inited more than once");
	}
	index = new ApiIndex();
	index.init(appContext);

}