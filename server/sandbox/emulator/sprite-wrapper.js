function eventToButtonName(event) {
    if (event.button === 0) {
        return "left";
    }
    if (event.button === 2) {
        return "right";
    }
    if (event.button === 1) {
        return "middle";
    }
}
function addButtonName(current, name) {
    if (!current) {
        return name;
    }
    if (!name) {
        return current;
    }
    const parts = current.split(' ');
    for (const part of parts) {
        if (part === name) {
            return current;
        }
    }
    parts.push(name);
    return parts.join(' ');
}
function removeButtonName(current, name) {
    if (!current) {
        return name;
    }
    if (!name) {
        return current;
    }
    const parts = current.split(' ');
    const ind = parts.indexOf(name);
    if (ind >= 0) {
        parts.splice(ind, 1);
    }
    return parts.join(' ');
}
export class SpriteWrapper {
    constructor(world, x = 0, y) {
        this.world = world;
        this._isMouseUp = "";
        this._isMouseDown = "";
        this._isPressed = "";
        this._isMouseIn = false;
        this.sprite = world.scene.Sprite({ x, y });
        $(this.sprite.dom).data("sprite-wrapper", this);
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
    static postUpdateSprites() {
        for (const s of SpriteWrapper._allSprites) {
            try {
                s.postFrameUpdate();
            }
            catch (e) {
                console.log("update error", e);
            }
        }
    }
    static spriteFromEvent(event) {
        return $(event && event.currentTarget).data("sprite-wrapper");
    }
    onMouseUp(event) {
        this._isMouseDown = "";
        this._isMouseUp = addButtonName(this._isMouseUp, eventToButtonName(event));
        this._isPressed = "";
    }
    onMouseEnter(event) {
        this._isMouseIn = true;
    }
    onMouseLeave(event) {
        this._isMouseIn = false;
    }
    onMouseDown(event) {
        const name = eventToButtonName(event);
        this._isMouseDown = addButtonName(this._isMouseDown, name);
        this._isMouseUp = "";
        this._isPressed = addButtonName(this._isPressed, name);
    }
    postFrameUpdate() {
        this._isMouseUp = "";
        this._isMouseDown = "";
    }
    isMouseOver() {
        return this._isMouseIn;
    }
    /**
     * Returns true if the specified mouse button was pressed in the last frame on this  sprite
     * @param button "left", "right" or "middle"
     */
    isMouseDown(button) {
        button = (button || "").trim().toLowerCase().replace("button", "");
        return this._isMouseDown.indexOf(button) >= 0;
    }
    /**
     * Returns true if the specified mouse button was depressed in the last frame, after
     * being pressed down earlier on this  sprite
     * @param button "left", "right" or "middle"
     */
    isMouseUp(button) {
        button = (button || "").trim().toLowerCase().replace("button", "");
        return this._isMouseUp.indexOf(button) >= 0;
    }
    /**
     * Returns true if the specified mouse button is currently pressed after an initial press
     * on this sprite
     * @param button "left", "right" or "middle"
     */
    isMousePressed(button) {
        button = (button || "").trim().toLowerCase().replace("button", "");
        return this._isPressed.indexOf(button) >= 0;
    }
    get x() {
        return this.sprite.x;
    }
    set x(newx) {
        this.sprite.setX(newx);
    }
    set visible(v) {
        this.sprite.setVisible(v);
    }
    get visible() {
        return this.sprite.isVisible();
    }
    get y() {
        return this.sprite.y;
    }
    set y(newy) {
        this.sprite.setY(newy);
    }
    destroy() {
        if (this.sprite) {
            $(this.sprite.dom).data("sprite-wrapper", null);
            this.sprite.remove();
            this.sprite = null;
        }
        const ind = SpriteWrapper._allSprites.indexOf(this);
        if (ind >= 0) {
            SpriteWrapper._allSprites.splice(ind, 1);
        }
    }
    setAnimation(name) {
        const url = this.world.makeSpritePath(name);
        this.world.scene.loadImages([url], () => {
            if (!this.sprite) { // destroyed since we've made the request
                return;
            }
            this.sprite.loadImg(url, false);
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
        this.sprite.setW(w);
    }
    get width() {
        return this.sprite.w;
    }
    get height() {
        return this.sprite.h;
    }
    set height(h) {
        this.sprite.setH(h);
    }
    setSize(width, height) {
        this.sprite.size(width, height);
    }
}
SpriteWrapper._allSprites = [];
//# sourceMappingURL=sprite-wrapper.js.map