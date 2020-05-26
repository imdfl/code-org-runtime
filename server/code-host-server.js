"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const compression = require("compression");
const fs = require("fs");
const fsPath = require("path");
const NodeUtils = require("util");
require('source-map-support').install();
class CodeHost {
    constructor() {
    }
    run() {
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
        app.use(function (req, res, next) {
            const origin = String(req.headers.origin) || "";
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
        app.use((req, res, next) => {
            next(createError(404));
        });
        // error handler
        app.use((err, req, res, next) => {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};
            // render the error page
            res.status(err.status || 500);
            res.render('error');
        });
        this.runServer();
    }
    runServer() {
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
        function normalizePort(val) {
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
        function onError(error) {
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
    installAPI(app) {
        this._renderedPath = fsPath.join(__dirname, "rendered");
        this._dataPath = fsPath.join(__dirname, "data");
        this._scriptsPath = fsPath.join(this._dataPath, "scripts");
        fs.mkdirSync(this._renderedPath, { recursive: true });
        const r = this._scriptRouter = express.Router();
        r.get("/:name", this.serveScript.bind(this));
        r.get("/raw/:name", this.serveRawScript.bind(this));
        app.use("/scripts", r);
        const api = this._apiRouter = express.Router();
        api.get("/list", this.listScripts.bind(this));
        app.use("/api", api);
    }
    async listScripts(req, res, next) {
        var recs = await this.listFolder(this._scriptsPath);
        return res.status(200).contentType("application/json")
            .send({
            error: "",
            data: recs
        }).end();
    }
    async serveScript(req, res, next) {
        const scriptPath = req.params["name"];
        var script = await this.loadScript(scriptPath);
        if (!script) {
            return res.status(404).send(`${scriptPath} not found`).end();
        }
        return res.status(200).contentType("application/javascript")
            .send(script).end();
    }
    async serveRawScript(req, res, next) {
        const scriptPath = req.params["name"];
        var script = await this.loadRawScript(scriptPath);
        if (!script) {
            return res.status(404).send(`${scriptPath} not found`).end();
        }
        return res.status(200).contentType("application/javascript")
            .send(script).end();
    }
    async loadScript(name) {
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
    async listFolder(url) {
        const fileNames = await NodeUtils.promisify(fs.readdir)(url);
        return fileNames.map(f => ({
            name: f,
            url: f,
            author: f,
            lastModification: new Date()
        }));
    }
    async readFile(path) {
        try {
            const b = await NodeUtils.promisify(fs.readFile)(path);
            return String(b);
        }
        catch (e) {
            return null;
        }
    }
    async loadRawScript(name) {
        name = (name || "").trim().replace(/\.js$/i, "");
        if (!name) {
            return "";
        }
        const scriptPath = fsPath.join(this._scriptsPath, `${name}.js`);
        return await this.readFile(scriptPath);
    }
    /**
     *
     * @param name already .js free
     * @param renderedPath
     */
    async renderScript(name, renderedPath) {
        try {
            const script = await this.loadRawScript(name);
            if (!script) {
                return null;
            }
            const headerPath = fsPath.join(this._dataPath, "script-header.js");
            const footerPath = fsPath.join(this._dataPath, "script-footer.js");
            const header = await this.readFile(headerPath);
            const footer = await this.readFile(footerPath);
            const ret = [header, script, footer].join('\n');
            fs.writeFile(renderedPath, ret, (err) => {
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
//# sourceMappingURL=code-host-server.js.map