import { SpriteWrapper } from "./sprite-wrapper.js";
import { RectFactory } from './rect-factory.js';
import { DrawState } from './draw-state.js';
export class NoWorld {
    constructor(root) {
        this.root = root;
        this._startTime = Date.now();
        this._frameCount = 0;
        this._drawState = new DrawState();
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
            const $e = $(String(root));
            if ($e.length === 1) {
                return $e;
            }
            return $(document.body);
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
        this._rects = new RectFactory(this.scene.dom);
    }
    preUpdate() {
        this._frameCount++;
    }
    postUpdate() {
        this._rects.update();
    }
    setBackground(color) {
        this.bg.color = color;
    }
    get rects() {
        return this._rects;
    }
    get drawState() {
        return this._drawState;
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