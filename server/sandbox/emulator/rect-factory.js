import { ObjectRecycler } from './object-recycler.js';
import { NOSVGRect } from './shapes.js';
const SVGNS = "http://www.w3.org/2000/svg";
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
        return new NOSVGRect(root);
    }
}
//# sourceMappingURL=rect-factory.js.map