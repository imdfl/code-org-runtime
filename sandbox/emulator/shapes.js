import { RecyclableDOMObject } from "./RecyclableDOMObject.js";
import { Similarity } from './object-recycler.js';
const SVGNS = "http://www.w3.org/2000/svg";
export class NOSVGShape extends RecyclableDOMObject {
    constructor(root) {
        super(root);
        const svg = this.svg = root.ownerDocument.createElementNS(SVGNS, "svg");
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
    }
    get height() {
        return this._height;
    }
    set height(h) {
        this._height = h;
    }
    get strokeColor() {
        return this._strokeColor;
    }
    set strokeColor(sc) {
        this._strokeColor = sc;
    }
    get strokeWeight() {
        return this._strokeWeight;
    }
    set strokeWeight(sw) {
        this._strokeWeight = sw;
    }
    get fillColor() {
        return this._fillColor;
    }
    set fillColor(f) {
        this._fillColor = f;
    }
}
export class NOSVGRect extends NOSVGShape {
    constructor(root) {
        super(root);
        const rect = this.rect = document.createElementNS(SVGNS, "rect");
        this.svg.appendChild(rect);
    }
    compareTo(req) {
        if (req.type !== "rect") {
            return Similarity.None;
        }
        return super.compareTo(req);
    }
    set width(w) {
        super.width = w;
        this.rect.setAttributeNS(null, "width", String(w));
    }
    set height(h) {
        super.height = h;
        this.rect.setAttributeNS(null, "height", String(h));
    }
    set strokeColor(sc) {
        super.strokeColor = sc;
        this.rect.setAttributeNS(null, "stroke", sc);
    }
    set strokeWeight(sw) {
        super.strokeWeight = sw;
        this.rect.setAttributeNS(null, "stroke-width", String(sw));
    }
    set fillColor(f) {
        super.fillColor = f;
        this.rect.setAttributeNS(null, "fill", f);
    }
}
export class NOSVGEllipse extends NOSVGShape {
    constructor(root) {
        super(root);
        const el = this.ellipse = document.createElementNS(SVGNS, "ellipse");
        this.svg.appendChild(el);
        this.ellipse.setAttributeNS(null, "cx", "0");
        this.ellipse.setAttributeNS(null, "cy", "0");
    }
    compareTo(req) {
        if (req.type !== "ellipse") {
            return Similarity.None;
        }
        return super.compareTo(req);
    }
    set width(w) {
        super.width = w;
        const r = Math.round(w / 2);
        this.ellipse.setAttributeNS(null, "rx", String(r));
        this.ellipse.setAttributeNS(null, "cx", String(r));
    }
    set height(h) {
        super.height = h;
        const r = Math.round(h / 2);
        this.ellipse.setAttributeNS(null, "ry", String(r));
        this.ellipse.setAttributeNS(null, "cy", String(r));
    }
    set strokeColor(sc) {
        super.strokeColor = sc;
        this.ellipse.setAttributeNS(null, "stroke", sc);
    }
    set strokeWeight(sw) {
        super.strokeWeight = sw;
        this.ellipse.setAttributeNS(null, "stroke-width", String(sw));
    }
    set fillColor(f) {
        super.fillColor = f;
        this.ellipse.setAttributeNS(null, "fill", f);
    }
}
//# sourceMappingURL=shapes.js.map