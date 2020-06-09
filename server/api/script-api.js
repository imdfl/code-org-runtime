"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptAPI = void 0;
const fs = require("fs");
const fsPath = require("path");
const NodeUtils = require("util");
const code_utils_1 = require("../utils/code-utils");
const base_api_1 = require("./base-api");
class ScriptAPI extends base_api_1.BaseAPI {
    install(appContext, routers) {
        super.install(appContext, routers);
        const r = routers.scriptRouter;
        r.get("/:user/:name", this.serveScript.bind(this));
        r.get("/raw/:user/:name", this.serveRawScript.bind(this));
        const api = routers.clientRouter; // this._apiRouter = express.Router();
        api.get("/users", this.listUsers.bind(this));
        api.get("/list/:user", this.listScripts.bind(this));
        api.get("/script/:user/:name", this.loadScriptData.bind(this));
        api.post("/render", this.renderOnce.bind(this));
    }
    async listScripts(req, res, next) {
        const user = await this.userFromRequest(req);
        if (!user) {
            return this.sendObjectResponse(res, "user not found", null);
        }
        var recs = await this.listUserFolder(user, "js");
        return this.sendObjectResponse(res, null, recs);
    }
    async listUsers(req, res, next) {
        const users = await NodeUtils.promisify(fs.readdir)(this.appContext.paths.scripts);
        const lstat = NodeUtils.promisify(fs.lstat);
        const ret = new Array();
        for (let name of users) {
            const stat = await lstat(fsPath.join(this.appContext.paths.scripts, name));
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
    async loadScriptData(req, res, next) {
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
        return this.sendObjectResponse(res, null, script);
    }
    async renderOnce(req, res, next) {
        const rawScript = req.body && req.body.script;
        if (!rawScript) {
            return res.status(400).send("no script body provided").end();
        }
        var script = await this.renderScriptFromBody(rawScript);
        return this.sendScriptResponse(res, script);
    }
    async serveScript(req, res, next) {
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
    async serveRawScript(req, res, next) {
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
    async loadScript(user, name) {
        const scriptId = code_utils_1.CodeUtils.makeScriptName(name);
        if (!user || !scriptId) {
            return null;
        }
        try {
            const ret = {
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
    async loadRawScript(user, name) {
        name = code_utils_1.CodeUtils.makeScriptName(name);
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
    async renderScript(user, scriptName) {
        try {
            const raw = await this.loadRawScript(user, scriptName);
            if (!raw) {
                return null;
            }
            const rendered = await this.renderScriptFromBody(raw);
            // const headerPath = fsPath.join(this.appContext.paths.data, "script-header.jspart");
            // const footerPath = fsPath.join(this.appContext.paths.data, "script-footer.jspart");
            // const header = await this.readFile(headerPath);
            // const footer = await this.readFile(footerPath);
            // const rendered = [header, raw, footer].join('\n');
            await NodeUtils.promisify(fs.mkdir)(user.renderPath, { recursive: true });
            const renderedPath = fsPath.join(user.renderPath, `${code_utils_1.CodeUtils.makeScriptName(scriptName)}.js`);
            fs.writeFile(renderedPath, rendered, (err) => {
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
    async renderScriptFromBody(body) {
        try {
            const headerPath = fsPath.join(this.appContext.paths.data, "script-header.jspart");
            const footerPath = fsPath.join(this.appContext.paths.data, "script-footer.jspart");
            const header = await this.readFile(headerPath);
            const footer = await this.readFile(footerPath);
            return [header, body, footer].join('\n');
        }
        catch (e) {
            return null;
        }
    }
}
exports.ScriptAPI = ScriptAPI;
//# sourceMappingURL=script-api.js.map