import { ObjectRecycler } from './object-recycler.js';
import { NOSVGEllipse } from './shapes.js';
const SVGNS = "http://www.w3.org/2000/svg";
export class EllipseFactory extends ObjectRecycler {
    constructor(root) {
        super(root);
    }
    /**
     * Changes the requst
     */
    addEllipse(ellipse) {
        ellipse.x -= Math.round(ellipse.width / 2);
        ellipse.y -= Math.round(ellipse.height / 2);
        this.addRequest(jQuery.extend(true, ellipse, { type: "ellipse" }));
    }
    createObject(root) {
        return new NOSVGEllipse(root);
    }
}
//# sourceMappingURL=ellipse-factory.js.map