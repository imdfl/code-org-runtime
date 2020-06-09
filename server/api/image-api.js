"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageAPI = void 0;
const base_api_1 = require("./base-api");
class ImageAPI extends base_api_1.BaseAPI {
    install(appContext, routers) {
        super.install(appContext, routers);
        const r = routers.scriptRouter;
        const api = routers.imagesRouter; // this._apiRouter = express.Router();
        api.get("/list/:user", this.listUserImages.bind(this));
        api.get("/:user/:name", this.loadImage.bind(this));
    }
    async listUserImages(req, res, next) {
        const user = await this.userFromRequest(req);
        if (!user) {
            return this.sendObjectResponse(res, "user not found", null);
        }
        var recs = await this.listUserFolder(user, "js");
        return this.sendObjectResponse(res, null, recs);
    }
    async loadImage(req, res, next) {
        // const users = await NodeUtils.promisify(fs.readdir)(this._scriptsPath);
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
}
exports.ImageAPI = ImageAPI;
//# sourceMappingURL=image-api.js.map