import * as express from "express";

export interface IAppRouters {
	/**
	 * General api
	 */
	readonly clientRouter: express.Router;
	/**
	 * Serving scripts
	 */
	readonly scriptRouter: express.Router;
	/**
	 * For content authors
	 */
	readonly authorRouter: express.Router;
	/**
	 * user images
	 */
	readonly imagesRouter: express.Router;
	/**
	 * user images
	 */
	readonly soundsRouter: express.Router;
}

export interface IAppPaths {
	/**
	 * The path of the root folder of the application
	 */
	readonly root: string;
	readonly scripts: string;
	readonly rendered: string;
	readonly data: string;
	readonly images: string;
	readonly sandbox: string;
}

export interface IAppContext {
	/**
	 * The application containing these routers
	 */
	readonly app: express.Application;

	/**
	 * The various paths that the api can access
	 */
	readonly paths: IAppPaths;
}

export interface INOAPI {
	install(appContext: IAppContext, routers: IAppRouters): void;
	readonly appContext: IAppContext;
}
