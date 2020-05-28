"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeUtils = void 0;
let CodeUtils = /** @class */ (() => {
    class CodeUtils {
        static makeScriptName(name) {
            return (name || "").trim().replace(CodeUtils.NAME_RE, "");
        }
    }
    CodeUtils.NAME_RE = /\.js$/i;
    return CodeUtils;
})();
exports.CodeUtils = CodeUtils;
//# sourceMappingURL=code-utils.js.map