import { SpriteWrapper } from "./sprite-wrapper.js";
import { RectFactory } from './rect-factory.js';
import { EllipseFactory } from './ellipse-factory.js';
import { DrawState } from './draw-state.js';
import { TextFactory } from './text-factory.js';
import { createGameInput } from "./game-input.js";
export class NoWorld {
    constructor(doc, _imagesPath, root) {
        this._imagesPath = _imagesPath;
        this.root = root;
        this._startTime = Date.now();
        this._frameCount = 0;
        this._drawState = new DrawState();
        const $ = window.jQuery;
        const $root = this.$root = (function () {
            if (!root) {
                return $(doc.body);
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
            return $(doc.body);
        }());
        this.sceneWidth = $root.width() || 400;
        this.sceneHeight = $root.height() || 400;
        this._scene = sjs.Scene({
            w: this.sceneWidth,
            h: this.sceneHeight,
            parent: $root[0]
        });
        this._input = createGameInput();
        this._input.connect($root);
        const bg = this.bg = this.createSprite(0, 0);
        bg.setSize(this.sceneWidth, this.sceneHeight);
        const dom = this._scene.layers["default"].dom;
        this._rects = new RectFactory(dom);
        this._text = new TextFactory(dom);
        this._ellipses = new EllipseFactory(dom);
        $root.on("mousedown", ".sjs-sprite", this.onSpriteMouseDown.bind(this));
        $root.on("mouseup", ".sjs-sprite", this.onSpriteMouseUp.bind(this));
        $root.on("mouseenter", ".sjs-sprite", this.onSpriteMouseEnter.bind(this));
        $root.on("mouseleave", ".sjs-sprite", this.onSpriteMouseLeave.bind(this));
    }
    /**
     * The path to the user images on the server
     */
    get imagesPath() {
        return this._imagesPath;
    }
    makeSpritePath(name) {
        if (!name) {
            return "";
        }
        if (name[0] === '/' || NoWorld.HTTP_RE.test(name)) {
            return name;
        }
        name = name.trim().toLowerCase();
        if (!name) {
            return "";
        }
        name = name.replace(NoWorld.IMAGE_RE, "");
        // if (!/\.png$/.test(name)) {
        // 	name += ".png";
        // }
        return [this._imagesPath, name].join('/');
        // const parts = name.split('/');
        // if (parts[0] !== "") {
        // 	parts.splice(0, 0, "");
        // }
        // if (parts[1] !== "images") {
        // 	parts.splice(1, 0, "images");
        // }
        // if (parts[2] === name) {
        // 	parts.splice(2, 0, "sprites");
        // }
        // return parts.join('/');
    }
    get input() {
        return this._input;
    }
    preUpdate() {
        this._frameCount++;
        this.drawState.reset();
    }
    postUpdate() {
        this._rects.update();
        this._ellipses.update();
        this._text.update();
        this._input.setupNextFrame();
        SpriteWrapper.postUpdateSprites();
    }
    setBackground(color) {
        this.bg.color = color;
    }
    get rects() {
        return this._rects;
    }
    get ellipses() {
        return this._ellipses;
    }
    get text() {
        return this._text;
    }
    get drawState() {
        return this._drawState;
    }
    get scene() {
        return this._scene;
    }
    createSprite(x, y) {
        return new SpriteWrapper(this, x, y);
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
    onSpriteMouseDown(event) {
        const s = SpriteWrapper.spriteFromEvent(event);
        if (s) {
            s.onMouseDown(event);
        }
    }
    onSpriteMouseUp(event) {
        const s = SpriteWrapper.spriteFromEvent(event);
        if (s) {
            s.onMouseUp(event);
        }
    }
    onSpriteMouseEnter(event) {
        const s = SpriteWrapper.spriteFromEvent(event);
        if (s) {
            s.onMouseEnter(event);
        }
    }
    onSpriteMouseLeave(event) {
        const s = SpriteWrapper.spriteFromEvent(event);
        if (s) {
            s.onMouseLeave(event);
        }
    }
}
NoWorld.IMAGE_RE = /\.(?:png|gif)$/i;
NoWorld.HTTP_RE = /^https?:\//i;
//# sourceMappingURL=no-world.js.map