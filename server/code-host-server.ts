import express = require('express');
import { NextFunction, Request, Response } from "express";
import compression = require("compression");
import { Application } from "express";
import * as fs from "fs";
import * as fsPath from "path";
import * as NodeUtils from "util";

require('source-map-support').install();

interface IListRecord {
	name: string;
	url: string;
	author: string
	lastModification: Date
}

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

	private installAPI(app: Application): void {
		this._renderedPath = fsPath.join(__dirname, "rendered");
		this._scriptsPath = fsPath.join(__dirname, "data", "scripts");
		fs.mkdirSync(this._renderedPath, { recursive: true });

		const r = this._scriptRouter = express.Router();
		r.get("/:name", this.serveScript.bind(this));
		app.use("/scripts", r);

		const api = this._apiRouter = express.Router();
		api.get("/list", this.listScripts.bind(this));
		app.use("/api", api);

	}

	private async listScripts(req: Request, res: Response, next: NextFunction): Promise<any> {

		var recs = await this.listFolder(this._scriptsPath);

		return res.status(200).contentType("application/javascript")
			.send({
				error: "",
				data: recs
			}).end();
	}

	private async serveScript(req: Request, res: Response, next: NextFunction): Promise<any> {
		const scriptPath = req.params["name"];
		var script = await this.loadScript(scriptPath);
		if (!script) {
			return res.status(404).send(`${scriptPath} not found`).end();
		}

		return res.status(200).contentType("application/javascript")
			.send(script).end();
	}

	private async loadScript(name: string): Promise<string> {
		if (!name || !(name = name.trim())) {
			return null;
		}
		try {
			name = name.replace(/\.js$/i, "");
			const fullPath = fsPath.join(this._renderedPath, `${name}.js`);
			const script = await this.readFile(fullPath);
			if (script) {
				return script;
			}
			const rendered = await this.renderScript(name, fullPath);
			return rendered;
		}
		catch (e) {
			console.error(e);
			return null;
		}
	}
	private async listFolder(url: string): Promise<IListRecord[]> {
		const fileNames = await NodeUtils.promisify(fs.readdir)(url);

		return fileNames.map(f => ({
			name: f,
			url: f,
			author: f,
			lastModification: new Date()
		}));
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

	/**
	 * 
	 * @param name already .js free
	 * @param renderedPath 
	 */
	private async renderScript(name: string, renderedPath: string): Promise<string> {
		try {
			const scriptPath = fsPath.join(this._scriptsPath, `${name}.js` );
			const script = await this.readFile(scriptPath);
			if (!script) {
				return null;
			}
			const headerPath = fsPath.join(this._scriptsPath, "../script-header.js" );
			const footerPath = fsPath.join(this._scriptsPath, "../script-footer.js" );
			const header = await this.readFile(headerPath);
			const footer = await this.readFile(footerPath);
			const ret = [header, script, footer].join('\n');
			fs.writeFile(renderedPath, ret, (err: any) => {
				if (err) {
					console.log("fs error in write rendered", renderedPath, err);
				}
			});
			return ret;
		}
		catch (e) {
			return null;
		}

	}


}

const host = new CodeHost();

host.run();