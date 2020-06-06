import express = require('express');
import { NextFunction, Request, Response } from "express";
import compression = require("compression");
import { Application } from "express";
import * as fs from "fs";
import * as fsPath from "path";
import * as NodeUtils from "util";
import { CodeUtils } from "./utils/code-utils";
import { INOServerUser } from 'models/user.model';

// TODO
// 1. Cache directory state and update it using file system watch
// https://www.codementor.io/@stefanomaglione114/file-watcher-with-node-js-nlmscwcl6 

require('source-map-support').install();

class CodeHost {

	private app: Application;

	public constructor() {

	}

	public run(): void {
		var createError = require('http-errors');
		var express = require('express');
		var path = require('path');
		var cookieParser = require('cookie-parser');
		var logger = require('morgan');

		var indexRouter = require('./routes/index');
		var usersRouter = require('./routes/users');

		var app = this.app = express();
		app.use(compression());

		// view engine setup
		app.set('views', path.join(__dirname, 'views'));
		app.set('view engine', 'ejs');

		app.use(logger('dev'));
		app.use(express.json());
		app.use(express.urlencoded({ extended: false }));
		app.use(cookieParser());

		app.use(function (req: Request, res: Response, next: NextFunction) {
			const origin: string = String(req.headers.origin) || "";
			res.setHeader('Access-Control-Allow-Origin', origin);
			res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
			res.setHeader("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Accept-Encoding, Content-Type, Accept, X-XSRF-Header, X-CSRF-Header, X-CSRF-Token, X-XSRF-Token, Cache-Control, Pragma, Expires");
			// res.end();
			next();
		});

		app.use(express.static(path.join(__dirname, 'public')));
		app.use('/client', express.static('client'));
		app.use('/dev', express.static('dev'));

		app.use('/', indexRouter);
		app.use('/users', usersRouter);
		this.installAPI(app);

		// catch 404 and forward to error handler
		app.use((req: Request, res: Response, next: NextFunction) => {
			next(createError(404));
		});

		// error handler
		app.use((err: any, req: Request, res: Response, next: NextFunction) => {
			// set locals, only providing error in development
			res.locals.message = err.message;
			res.locals.error = req.app.get('env') === 'development' ? err : {};

			// render the error page
			res.status(err.status || 500);
			res.render('error');
		});

		this.runServer();
	}

	private runServer(): void {
		var debug = require('debug')('server:server');
		var http = require('http');
		var app = this.app;

		/**
		 * Get port from environment and store in Express.
		 */

		var port = normalizePort(process.env.PORT || '6677');
		app.set('port', port);

		/**
		 * Create HTTP server.
		 */

		var server = http.createServer(app);

		/**
		 * Listen on provided port, on all network interfaces.
		 */

		server.listen(port);
		server.on('error', onError);
		server.on('listening', onListening);

		/**
		 * Normalize a port into a number, string, or false.
		 */

		function normalizePort(val: any): number | boolean {
			var port = parseInt(val, 10);

			if (isNaN(port)) {
				// named pipe
				return val;
			}

			if (port >= 0) {
				// port number
				return port;
			}

			return false;
		}

		/**
		 * Event listener for HTTP server "error" event.
		 */

		function onError(error: any) {
			if (error.syscall !== 'listen') {
				throw error;
			}

			var bind = typeof port === 'string'
				? 'Pipe ' + port
				: 'Port ' + port;

			// handle specific listen errors with friendly messages
			switch (error.code) {
				case 'EACCES':
					console.error(bind + ' requires elevated privileges');
					process.exit(1);
					break;
				case 'EADDRINUSE':
					console.error(bind + ' is already in use');
					process.exit(1);
					break;
				default:
					throw error;
			}
		}

		/**
		 * Event listener for HTTP server "listening" event.
		 */

		function onListening() {
			var addr = server.address();
			var bind = typeof addr === 'string'
				? 'pipe ' + addr
				: 'port ' + addr.port;
			console.log('Listening on ' + bind);
		}

	}

	private _scriptRouter: express.Router;
	private _apiRouter: express.Router;
	private _renderedPath: string;
	private _scriptsPath: string;
	private _dataPath: string;

	private installAPI(app: Application): void {
		this._renderedPath = fsPath.join(__dirname, "rendered");
		this._dataPath = fsPath.join(__dirname, "data");
		this._scriptsPath = fsPath.join(this._dataPath, "scripts");
		fs.mkdirSync(this._renderedPath, { recursive: true });

		const r = this._scriptRouter = express.Router();
		r.get("/:user/:name", this.serveScript.bind(this));
		r.get("/raw/:user/:name", this.serveRawScript.bind(this));
		app.use("/scripts", r);

		const api = this._apiRouter = express.Router();
		api.get("/users", this.listUsers.bind(this));
		api.get("/list/:user", this.listScripts.bind(this));
		api.get("/script/:user/:name", this.loadScriptData.bind(this));
		api.post("/render", this.renderOnce.bind(this));
		app.use("/api", api);

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

		const users = await NodeUtils.promisify(fs.readdir)(this._scriptsPath);
		const lstat = NodeUtils.promisify(fs.lstat);
		const ret = new Array<Pick<INOServerUser, "name" | "id" | "clientPath">>();
		for (let name of users) {
			const stat = await lstat(fsPath.join(this._scriptsPath, name));
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
	private async listUserFolder(user: INOServerUser, subFolder: string): Promise<IScriptRecord[]> {
		const url = fsPath.join(this._scriptsPath, user.id, subFolder || "");
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

	private async readFile(path: string): Promise<string> {
		try {
			const b: Buffer = await NodeUtils.promisify(fs.readFile)(path);
			return String(b);
		}
		catch (e) {
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
			const headerPath = fsPath.join(this._dataPath, "script-header.jspart");
			const footerPath = fsPath.join(this._dataPath, "script-footer.jspart");
			const header = await this.readFile(headerPath);
			const footer = await this.readFile(footerPath);
			const rendered = [header, raw, footer].join('\n');
			const renderedPath = fsPath.join(user.renderPath, CodeUtils.makeScriptName(scriptName));
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
			const headerPath = fsPath.join(this._dataPath, "script-header.jspart");
			const footerPath = fsPath.join(this._dataPath, "script-footer.jspart");
			const header = await this.readFile(headerPath);
			const footer = await this.readFile(footerPath);
			return [header, body, footer].join('\n');
		}
		catch (e) {
			return null;
		}

	}

	private sendObjectResponse(res: Response, error: any, data: any) {
		return res.status(200).contentType("application/json")
		.send({
			error,
			data
		}).end();
	}

	private sendScriptResponse(res: Response, script: string) {
		return res.status(200).contentType("application/javascript")
			.send(script).end();
	}

	private async userFromRequest(req: Request): Promise<INOServerUser> {
		const userName = req.params.user as string;
		if (!userName) {
			return null;
		}
		const userId = this.makeUserId(userName);
		const fullPath: string = fsPath.join(this._scriptsPath, userId);
		try {
			const stat = await NodeUtils.promisify(fs.lstat)(fullPath);
			if (stat && stat.isDirectory) {
				return {
					name: userName,
					path: fullPath,
					clientPath: `/scripts/${userId}`,
					renderPath: fsPath.join(this._renderedPath, userId),
					id: userId
				}
			}
		}
		catch (e) {
			console.error(e);
		}
		return null;
	} 

	private makeUserId(name: string): string {
		if (!name) {
			return null;
		}
		return name.trim().toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/\-\-+/g, '-')
			.replace(/[^a-z0-9_\-\.\$]+/ig, "_");
	}

	private makeUserName(id: string): string {
		if (!id) {
			return null;
		}
		return id
			.replace(/[_\-+]+/g, ' ')
			.replace(/\s\s+/g, ' ');
 
	}
}

const host = new CodeHost();

host.run();