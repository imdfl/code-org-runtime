import { RecyclableDOMObject } from "./RecyclableDOMObject.js";
import { IRecycleRequest, Similarity } from './object-recycler.js';

interface IShapeRequest extends IRecycleRequest {
	width: number;
	height: number;
	strokeColor: string;
	strokeWeight: number;
	fillColor: string;
}

export interface IRectRequest extends IShapeRequest {
}

export interface IEllipseRequest extends IShapeRequest {
}

const SVGNS = "http://www.w3.org/2000/svg";

export abstract class NOSVGShape extends RecyclableDOMObject {
	protected _width: number;
	protected _height: number;
	protected _strokeColor: string;
	protected _strokeWeight: number;
	protected _fillColor: string;

	protected readonly svg: SVGElement;

	constructor(root: HTMLElement) {
		super(root);
		const svg = this.svg = root.ownerDocument.createElementNS(SVGNS, "svg");
		svg.setAttribute('style', 'position: absolute;');
		svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
		this.element = svg;
	}

	public compareTo(req: IRecycleRequest): Similarity {
		if (req.type !== "rect") {
			return Similarity.None;
		}
		const other = req as IRectRequest;
		if (other.width !== this.width || other.height !== this.height
			|| other.strokeColor !== this.strokeColor || other.strokeWeight !== this.strokeWeight
			|| other.fillColor !== this.fillColor) {
				return Similarity.SameType;
		}
		return other.x !== this.x || other.y !== this.y ? Similarity.Similar : Similarity.Identical;
	}

	public get width() {
		return this._width;
	}

	public set width(w: number) {
		this._width = w;
	}


	public get height() {
		return this._height;
	}

	public set height(h: number) {
		this._height = h;
	}

	public get strokeColor() {
		return this._strokeColor;
	}

	public set strokeColor(sc: string) {
		this._strokeColor = sc;
	}

	public get strokeWeight() {
		return this._strokeWeight;
	}

	public set strokeWeight(sw: number) {
		this._strokeWeight = sw;
	}

	public get fillColor() {
		return this._fillColor;
	}

	public set fillColor(f: string) {
		this._fillColor = f;
	}
}

export class NOSVGRect extends NOSVGShape {

	protected readonly rect: SVGRectElement;

	constructor(root: HTMLElement) {
		super(root);
		const rect = this.rect = document.createElementNS(SVGNS, "rect");
		this.svg.appendChild(rect);
	}

	compareTo(req: IRecycleRequest): Similarity {
		if (req.type !== "rect") {
			return Similarity.None;
		}
		return super.compareTo(req);
	}


	public set width(w: number) {
		super.width = w;
		this.rect.setAttributeNS(null, "width", String(w));
	}


	public set height(h: number) {
		super.height = h;
		this.rect.setAttributeNS(null, "height", String(h));
	}

	public set strokeColor(sc: string) {
		super.strokeColor = sc;
		this.rect.setAttributeNS(null, "stroke", sc);
	}

	public set strokeWeight(sw: number) {
		super.strokeWeight = sw;
		this.rect.setAttributeNS(null, "stroke-width", String(sw));
	}

	public set fillColor(f: string) {
		super.fillColor = f;
		this.rect.setAttributeNS(null, "fill", f);
	}
}

export class NOSVGEllipse extends NOSVGShape {

	protected readonly ellipse: SVGEllipseElement;

	constructor(root: HTMLElement) {
		super(root);
		const el = this.ellipse = document.createElementNS(SVGNS, "ellipse");
		this.svg.appendChild(el);
		this.ellipse.setAttributeNS(null, "cx", "0");
		this.ellipse.setAttributeNS(null, "cy", "0");
	}

	compareTo(req: IRecycleRequest): Similarity {
		if (req.type !== "ellipse") {
			return Similarity.None;
		}
		return super.compareTo(req);
	}


	public set width(w: number) {
		super.width = w;
		const r = Math.round(w / 2);
		this.ellipse.setAttributeNS(null, "rx", String(r));
		this.ellipse.setAttributeNS(null, "cx", String(r));
	}


	public set height(h: number) {
		super.height = h;
		const r = Math.round(h / 2);
		this.ellipse.setAttributeNS(null, "ry", String(r));
		this.ellipse.setAttributeNS(null, "cy", String(r));
	}

	public set strokeColor(sc: string) {
		super.strokeColor = sc;
		this.ellipse.setAttributeNS(null, "stroke", sc);
	}

	public set strokeWeight(sw: number) {
		super.strokeWeight = sw;
		this.ellipse.setAttributeNS(null, "stroke-width", String(sw));
	}

	public set fillColor(f: string) {
		super.fillColor = f;
		this.ellipse.setAttributeNS(null, "fill", f);
	}
}
