"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAPI = void 0;
const fs = require("fs");
const fsPath = require("path");
const NodeUtils = require("util");
const code_utils_1 = require("../utils/code-utils");
class BaseAPI {
    install(appContext, routers) {
        this._appContext = appContext;
    }
    get appContext() {
        return this._appContext;
    }
    async listUserFolder(user, subFolder) {
        const url = fsPath.join(this._appContext.paths.scripts, user.id, subFolder || "");
        const fileNames = await NodeUtils.promisify(fs.readdir)(url);
        return fileNames.map(f => {
            const name = code_utils_1.CodeUtils.makeScriptName(f);
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
    async readFile(path) {
        try {
            const b = await NodeUtils.promisify(fs.readFile)(path);
            return String(b);
        }
        catch (e) {
            return null;
        }
    }
    sendObjectResponse(res, error, data) {
        return res.status(200).contentType("application/json")
            .send({
            error,
            data
        }).end();
    }
    sendScriptResponse(res, script) {
        return res.status(200).contentType("application/javascript")
            .send(script).end();
    }
    async userFromRequest(req) {
        const userName = req.params.user;
        if (!userName) {
            return null;
        }
        const userId = this.makeUserId(userName);
        const fullPath = fsPath.join(this._appContext.paths.scripts, userId);
        try {
            const stat = await NodeUtils.promisify(fs.lstat)(fullPath);
            if (stat && stat.isDirectory) {
                return {
                    name: userName,
                    path: fullPath,
                    clientPath: `/scripts/${userId}`,
                    renderPath: fsPath.join(this._appContext.paths.rendered, userId),
                    id: userId
                };
            }
        }
        catch (e) {
            console.error(e);
        }
        return null;
    }
    makeUserId(name) {
        if (!name) {
            return null;
        }
        return name.trim().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/\-\-+/g, '-')
            .replace(/[^a-z0-9_\-\.\$]+/ig, "_");
    }
    makeUserName(id) {
        if (!id) {
            return null;
        }
        return id
            .replace(/[_\-+]+/g, ' ')
            .replace(/\s\s+/g, ' ');
    }
}
exports.BaseAPI = BaseAPI;
//# sourceMappingURL=base-api.js.map