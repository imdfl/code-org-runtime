export class SpriteWrapper {
    constructor(scene, x = 0, y) {
        this.scene = scene;
        this._width = 0;
        this._height = 0;
        this.sprite = scene.Sprite();
        this.sprite.setX(x);
        this.sprite.setY(y);
        SpriteWrapper._allSprites.push(this);
    }
    static get allSprites() {
        return this._allSprites.slice();
    }
    static updateSprites() {
        for (const s of SpriteWrapper._allSprites) {
            try {
                s.sprite.applyVelocity();
                s.sprite.update();
            }
            catch (e) {
                console.log("update error", e);
            }
        }
    }
    static makeSpriteName(name) {
        name = (name || "").trim().toLowerCase();
        if (!name) {
            return "";
        }
        if (!/\.png$/.test(name)) {
            name += ".png";
        }
        const parts = name.split('/');
        if (parts[0] !== "") {
            parts.splice(0, 0, "");
        }
        if (parts[1] !== "images") {
            parts.splice(1, 0, "images");
        }
        if (parts[2] === name) {
            parts.splice(2, 0, "sprites");
        }
        return parts.join('/');
    }
    get x() {
        return this.sprite.x;
    }
    set x(newx) {
        this.sprite.setX(newx);
    }
    get y() {
        return this.sprite.y;
    }
    set y(newy) {
        this.sprite.setY(newy);
    }
    destroy() {
        if (this.sprite) {
            this.sprite.remove();
            this.sprite = null;
        }
        const ind = SpriteWrapper._allSprites.indexOf(this);
        if (ind >= 0) {
            SpriteWrapper._allSprites.splice(ind, 1);
        }
    }
    setAnimation(name) {
        this.scene.loadImages([SpriteWrapper.makeSpriteName(name)], () => {
            this.sprite.loadImg(SpriteWrapper.makeSpriteName(name), false);
            const w = this.width || this.sprite.img.width;
            const h = this.height || this.sprite.img.height;
            this.setSize(w, h);
        });
    }
    isTouching(other) {
        return this.sprite.collidesWith(other.sprite);
    }
    get color() {
        return this.sprite.color;
    }
    set color(color) {
        this.sprite.setColor(color);
    }
    get name() {
        return this._name;
    }
    set name(n) {
        this._name = n || "";
    }
    get scale() {
        return this.sprite.xscale;
    }
    set scale(s) {
        this.sprite.scale(s);
    }
    set velocityX(v) {
        this.sprite.xv = v;
    }
    get velocityX() {
        return this.sprite.xv;
    }
    set velocityY(v) {
        this.sprite.yv = v;
    }
    get velocityY() {
        return this.sprite.yv;
    }
    set width(w) {
        this._width = w;
        this.sprite.size(w, this.height);
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    set height(h) {
        this._height = h;
        this.sprite.size(this.width, h);
    }
    setSize(width, height) {
        this.sprite.size(width, height);
    }
}
SpriteWrapper._allSprites = [];
//# sourceMappingURL=sprite-wrapper.js.map