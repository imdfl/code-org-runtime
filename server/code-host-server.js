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
        app.use(express.static(path.join(__dirname, 'public')));
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
            debug('Listening on ' + bind);
        }
    }
    installAPI(app) {
        this._renderedPath = fsPath.join(__dirname, "rendered");
        fs.mkdirSync(this._renderedPath, { recursive: true });
        const r = this._apiRouter = express.Router();
        app.use("/scripts", r);
        r.get("/:name", this.serveScript.bind(this));
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
    async loadScript(name) {
        if (!name || !(name = name.trim())) {
            return null;
        }
        try {
            name = name.replace(/\.js$/i, "");
            const fullPath = fsPath.join(__dirname, "rendered", `${name}.js`);
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
    async readFile(path) {
        try {
            const b = await NodeUtils.promisify(fs.readFile)(path);
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
    async renderScript(name, renderedPath) {
        try {
            const scriptPath = fsPath.join(__dirname, "data", "scripts", `${name}.js`);
            const script = await this.readFile(scriptPath);
            if (!script) {
                return null;
            }
            const headerPath = fsPath.join(__dirname, "data", "script-header.js");
            const footerPath = fsPath.join(__dirname, "data", "script-footer.js");
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