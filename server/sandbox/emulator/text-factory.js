import { ObjectRecycler, Similarity } from './object-recycler.js';
import { RecyclableDOMObject } from './RecyclableDOMObject.js';
class TextDisplay extends RecyclableDOMObject {
    constructor(root) {
        super(root);
        const div = root.ownerDocument.createElement("div");
        div.setAttribute('style', 'position: absolute;');
        this.element = div;
    }
    compareTo(req) {
        if (req.type !== "text") {
            return Similarity.None;
        }
        const other = req;
        if (other.text !== this.text || other.size !== this.size
            || other.color !== this.color || other.font !== this.font) {
            return Similarity.SameType;
        }
        return other.x !== this.x || other.y !== this.y ? Similarity.Similar : Similarity.Identical;
    }
    get color() {
        return this._color;
    }
    set color(sc) {
        this._color = sc;
        this.$element.css("color", sc);
    }
    get size() {
        return this._fontSize;
    }
    set size(s) {
        this._fontSize = s;
        this.$element.css("font-size", `${s}px`);
    }
    get font() {
        return this._font;
    }
    set font(f) {
        this._font = f;
        this.$element.css("font-family", f);
    }
    get text() {
        return this.$element.text();
    }
    set text(s) {
        this.$element.text(s);
    }
}
export class TextFactory extends ObjectRecycler {
    constructor(root) {
        super(root);
    }
    /**
     * Changes the requst
     */
    addText(textData) {
        this.addRequest(jQuery.extend(true, textData, { type: "text" }));
    }
    createObject(root) {
        return new TextDisplay(root);
    }
}
//# sourceMappingURL=text-factory.js.map