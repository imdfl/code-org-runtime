"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installAPI = void 0;
const express = require("express");
const script_api_1 = require("./script-api");
const image_api_1 = require("./image-api");
class AppRouters {
    constructor(app) {
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
    constructor() {
    }
    init(appContext) {
        this.routers = new AppRouters(appContext.app);
        const sapi = new script_api_1.ScriptAPI();
        sapi.install(appContext, this.routers);
        const imgApi = new image_api_1.ImageAPI();
        imgApi.install(appContext, this.routers);
    }
}
let index = null;
/**
 * Installs the API
 * @param app The express application
 * @param rootPath Path of the root directory of this app
 */
exports.installAPI = (appContext) => {
    if (index !== null) {
        throw new Error("API Index inited more than once");
    }
    index = new ApiIndex();
    index.init(appContext);
};
//# sourceMappingURL=index.js.map