import express = require('express');
import { NextFunction, Request, Response } from "express";
import compression = require("compression");
import { Application } from "express";
import * as fs from "fs";
import * as fsPath from "path";
import * as NodeUtils from "util";
import { CodeUtils } from "./utils/code-utils";
import { INOServerUser } from 'models/user.model';
import * as Proxy from "express-http-proxy";
import { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";
import { installAPI } from "./api/index";
import { IAppPaths } from 'api/interfaces';
// TODO
// 1. Cache directory state and update it using file system watch
// https://www.codementor.io/@stefanomaglione114/file-watcher-with-node-js-nlmscwcl6 
// http://www.passportjs.org/docs/
// use google oauth2, the credentials are in settings/settings.json
// add settings service from knowsome-common

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
		["client", "sandbox"].forEach(s => {
			app.use(`/${s}`, express.static(path.join(__dirname, s)));
		});
		const headerUpdater = (
			headers: IncomingHttpHeaders,
			userReq: Request,
			userRes: Response,
			proxyReq: Request,
			proxyRes: Response
		) => {
			const h: OutgoingHttpHeaders = headers as OutgoingHttpHeaders;
			const h1 = userRes.getHeaders();
			h1.contentType = (proxyRes as any).headers["content-type"];

			return h1;
		};
		const apiProxy = Proxy('localhost:4200', {
			proxyReqPathResolver: (req: Request) => {
				return req.url.replace(/\/dev/, '/');
			},

			userResHeaderDecorator: headerUpdater

		});

		// For the angular server page updater
		const directProxy = (root: string) => {
			return Proxy("localhost:4200", {
				proxyReqPathResolver: (req: Request) => {
					return req.url.replace(/^\//, `/${root}/`);
				},

				userResHeaderDecorator: headerUpdater
			});
		};

		app.use('/dev', apiProxy);
		app.use('/sockjs-node', directProxy("sockjs-node"));
		app.use('/__webpack_dev_server__', directProxy("__webpack_dev_server__"));

		app.use('/', indexRouter);
		app.use('/users', usersRouter);

		const appPaths = {
			root: __dirname,
			data: fsPath.join(__dirname, "data"),
			scripts: null as string,
			images: fsPath.join(__dirname, "images"),
			rendered: fsPath.join(__dirname, "rendered"),
			sandbox: fsPath.join(__dirname, "sandbox")
		};
		appPaths.scripts = fsPath.join(appPaths.data, "scripts");
		fs.mkdirSync(appPaths.rendered, { recursive: true });
		installAPI({ app, paths: appPaths });

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
}

const host = new CodeHost();

host.run();