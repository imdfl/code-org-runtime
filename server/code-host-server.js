"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compression = require("compression");
const fs = require("fs");
const fsPath = require("path");
const Proxy = require("express-http-proxy");
const index_1 = require("./api/index");
// TODO
// 1. Cache directory state and update it using file system watch
// https://www.codementor.io/@stefanomaglione114/file-watcher-with-node-js-nlmscwcl6 
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
        ["client", "sandbox"].forEach(s => {
            app.use(`/${s}`, express.static(path.join(__dirname, s)));
        });
        const headerUpdater = (headers, userReq, userRes, proxyReq, proxyRes) => {
            const h = headers;
            const h1 = userRes.getHeaders();
            h1.contentType = proxyRes.headers["content-type"];
            return h1;
        };
        const apiProxy = Proxy('localhost:4200', {
            proxyReqPathResolver: (req) => {
                return req.url.replace(/\/dev/, '/');
            },
            userResHeaderDecorator: headerUpdater
        });
        // For the angular server page updater
        const directProxy = (root) => {
            return Proxy("localhost:4200", {
                proxyReqPathResolver: (req) => {
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
            scripts: null,
            images: fsPath.join(__dirname, "images"),
            rendered: fsPath.join(__dirname, "rendered"),
        };
        appPaths.scripts = fsPath.join(appPaths.data, "scripts");
        fs.mkdirSync(appPaths.rendered, { recursive: true });
        index_1.installAPI({ app, paths: appPaths });
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
}
const host = new CodeHost();
host.run();
//# sourceMappingURL=code-host-server.js.map