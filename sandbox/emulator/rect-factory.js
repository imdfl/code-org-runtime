import { ObjectRecycler, Similarity } from './object-recycler.js';
import { RecyclableDOMObject } from './RecyclableDOMObject.js';
class Rect extends RecyclableDOMObject {
    constructor(root) {
        super(root);
        const svg = this.svg = root.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('style', 'position: absolute;');
        svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        this.element = svg;
    }
    compareTo(req) {
        if (req.type !== "rect") {
            return Similarity.None;
        }
        const other = req;
        if (other.width !== this.width || other.height !== this.height
            || other.strokeColor !== this.strokeColor || other.strokeWeight !== this.strokeWeight
            || other.fillColor !== this.fillColor) {
            return Similarity.SameType;
        }
        return other.x !== this.x || other.y !== this.y ? Similarity.Similar : Similarity.Identical;
    }
    get width() {
        return this._width;
    }
    set width(w) {
        this._width = w;
        // svg.setAttribute('width', '600');
        // svg.setAttribute('height', '250');
    }
    get height() {
        return this._height;
    }
    set height(h) {
        this._height = h;
        // svg.setAttribute('height', '250');
    }
    get strokeColor() {
        return this._strokeColor;
    }
    set strokeColor(sc) {
        this._strokeColor = sc;
        // svg.setAttribute('height', '250');
    }
    get strokeWeight() {
        return this._strokeWeight;
    }
    set strokeWeight(sw) {
        this._strokeWeight = sw;
        // svg.setAttribute('height', '250');
    }
    get fillColor() {
        return this._fillColor;
    }
    set fillColor(f) {
        this._fillColor = f;
        // svg.setAttribute('height', '250');
    }
}
export class RectFactory extends ObjectRecycler {
    constructor(root) {
        super(root);
    }
    /**
     * Changes the requst
     */
    addRect(rect) {
        this.addRequest(jQuery.extend(true, rect, { type: "rect" }));
    }
    createObject(root) {
        return new Rect(root);
    }
}
//# sourceMappingURL=rect-factory.js.map