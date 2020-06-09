"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaAPI = void 0;
const fs = require("fs");
const fsPath = require("path");
const NodeUtils = require("util");
const code_utils_1 = require("../utils/code-utils");
const base_api_1 = require("./base-api");
class MediaAPI extends base_api_1.BaseAPI {
    install(appContext, routers) {
        super.install(appContext, routers);
        this._defaultImagePath = fsPath.join(appContext.paths.sandbox, "images", "default.png");
        const api = routers.imagesRouter; // this._apiRouter = express.Router();
        api.get("/list/:user", this.listUserImages.bind(this));
        api.get("/:user/:name", this.loadImage.bind(this));
    }
    async listUserImages(req, res, next) {
        const user = await this.userFromRequest(req);
        if (!user) {
            return this.sendObjectResponse(res, "user not found", null);
        }
        var recs = await this.listUserFolder(user, "images");
        return this.sendObjectResponse(res, null, recs);
    }
    async loadImage(req, res, next) {
        const user = await this.userFromRequest(req);
        if (!user) {
            return this.sendObjectResponse(res, "user not found", null);
        }
        const imageId = code_utils_1.CodeUtils.makeImageName(req.params.name);
        const imagePath = fsPath.join(user.path, "images", `${imageId}.png`);
        const exists = await NodeUtils.promisify(fs.exists)(imagePath);
        return res.sendFile(exists ? imagePath : this._defaultImagePath);
        // const lstat = NodeUtils.promisify(fs.lstat);
        // const ret = new Array<Pick<INOServerUser, "name" | "id" | "clientPath">>();
        // for (let name of users) {
        // 	const stat = await lstat(fsPath.join(this._scriptsPath, name));
        // 	if (stat && stat.isDirectory()) {
        // 		ret.push({
        // 			name: this.makeUserName(name),
        // 			id: name,
        // 			clientPath: `/scripts/${name}}`
        // 		});
        // 	}
        // }
        // return this.sendObjectResponse(res, null, ret);
    }
    async listUserFolder(user, subFolder) {
        const url = fsPath.join(this.appContext.paths.scripts, user.id, subFolder || "");
        const fileNames = await NodeUtils.promisify(fs.readdir)(url);
        return fileNames.map(f => {
            const name = code_utils_1.CodeUtils.makeImageName(f);
            return {
                name: f,
                id: name,
                url: `/images/${user.id}/${name}.png`,
                author: user.name,
                modification: new Date()
            };
        });
    }
}
exports.MediaAPI = MediaAPI;
//# sourceMappingURL=media-api.js.map