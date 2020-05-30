import { SpriteWrapper } from "./sprite-wrapper.js";
export class NoWorld {
    constructor(root) {
        this.root = root;
        this._startTime = Date.now();
        this._frameCount = 0;
        const $ = window.jQuery;
        const $root = this.$root = (function () {
            if (!root) {
                return $(document.body);
            }
            if (typeof root === "object") {
                if (root instanceof HTMLElement) {
                    return $(root);
                }
                if (root instanceof jQuery) {
                    return root;
                }
            }
            root = String(root);
            let $e;
            for (const selector of [root, `#{root}`]) {
                $e = $(selector);
                if ($e.length === 1) {
                    return $e;
                }
                return $(document.body);
            }
        }());
        this.sceneWidth = $root.width() || 400;
        this.sceneHeight = $root.height() || 400;
        this._scene = sjs.Scene({
            w: this.sceneWidth,
            h: this.sceneHeight,
            parent: $root[0]
        });
        const bg = this.bg = this.createSprite(0, 0);
        bg.setSize(this.sceneWidth, this.sceneHeight);
    }
    update() {
        this._frameCount++;
    }
    setBackground(color) {
        this.bg.color = color;
    }
    get scene() {
        return this._scene;
    }
    createSprite(x, y) {
        return new SpriteWrapper(this._scene, x, y);
    }
    get width() {
        return this.sceneWidth;
    }
    get height() {
        return this.sceneHeight;
    }
    get mouseX() {
        return 0; // TODO
    }
    get mouseY() {
        return 0; // TODO
    }
    get frameRate() {
        return 40; // TODO
    }
    get frameCount() {
        return this._frameCount;
    }
    get seconds() {
        return (Date.now() - this._startTime) / 1000;
    }
}
//# sourceMappingURL=no-world.js.map