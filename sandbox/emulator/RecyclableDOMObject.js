export class RecyclableDOMObject {
    constructor(root) {
        this.root = root;
        this._x = 0;
        this._y = 0;
        this.$element = jQuery("");
    }
    applyProperties(props) {
        Object.keys(props).forEach(key => {
            if (key !== "type" && props[key] !== this[key]) {
                this[key] = props[key];
            }
        });
    }
    dispose() {
        this.element = null;
    }
    set element(e) {
        const $e = jQuery(e);
        if (!$e.is(this.$element)) {
            this.$element.remove();
            this.$element = $e;
            $e.appendTo(this.root);
        }
    }
    get x() {
        return this._x;
    }
    set x(newx) {
        this._x = newx;
        this.$element.css("left", `${newx}px`);
    }
    get y() {
        return this._y;
    }
    set y(newy) {
        this._y = newy;
        this.$element.css("top", `${newy}px`);
    }
}
//# sourceMappingURL=RecyclableDOMObject.js.map