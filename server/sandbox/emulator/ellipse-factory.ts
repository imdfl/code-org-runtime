import { ObjectRecycler, IRecyclableObject, IRecycleRequest, Similarity } from './object-recycler.js';
import { NOSVGEllipse, IEllipseRequest } from './shapes.js';


const SVGNS = "http://www.w3.org/2000/svg";


export class EllipseFactory extends ObjectRecycler<NOSVGEllipse, IEllipseRequest> {
	public constructor(root: HTMLElement) {
		super(root);
	}

	/**
	 * Changes the requst
	 */
	public addEllipse(ellipse: Omit<IEllipseRequest, "type">) {
		ellipse.x -= Math.round(ellipse.width / 2);
		ellipse.y -= Math.round(ellipse.height / 2);
		this.addRequest(jQuery.extend(true, ellipse, { type: "ellipse" }));
	}

	protected createObject(root: HTMLElement): NOSVGEllipse {
		return new NOSVGEllipse(root);
	}
}
