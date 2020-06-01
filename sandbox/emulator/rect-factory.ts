import { ObjectRecycler, IRecyclableObject, IRecycleRequest, Similarity } from './object-recycler.js';
import { NOSVGRect, IRectRequest } from './shapes.js';

const SVGNS = "http://www.w3.org/2000/svg";


export class RectFactory extends ObjectRecycler<NOSVGRect, IRectRequest> {
	public constructor(root: HTMLElement) {
		super(root);
	}

	/**
	 * Changes the requst
	 */
	public addRect(rect: Omit<IRectRequest, "type">) {
		this.addRequest(jQuery.extend(true, rect, { type: "rect" }));
	}

	protected createObject(root: HTMLElement): NOSVGRect {
		return new NOSVGRect(root);
	}
}
