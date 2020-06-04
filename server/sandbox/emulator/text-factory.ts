import { ObjectRecycler, IRecyclableObject, IRecycleRequest, Similarity } from './object-recycler.js';
import { RecyclableDOMObject } from './RecyclableDOMObject.js';

interface ITextRequest extends IRecycleRequest {
	font: string;
	color: string;
	size: number;
	text: string;
}

class TextDisplay extends RecyclableDOMObject {
	private _color: string;
	private _fontSize: number;
	private _font: string;

	constructor(root: HTMLElement) {
		super(root);
		const div = root.ownerDocument.createElement("div");
		div.setAttribute('style', 'position: absolute;');
		this.element = div;
	}

	compareTo(req: IRecycleRequest): Similarity {
		if (req.type !== "text") {
			return Similarity.None;
		}
		const other = req as ITextRequest;
		if (other.text !== this.text || other.size !== this.size
			|| other.color !== this.color || other.font !== this.font) {
				return Similarity.SameType;
		}
		return other.x !== this.x || other.y !== this.y ? Similarity.Similar : Similarity.Identical;
	}


	public get color() {
		return this._color;
	}

	public set color(sc: string) {
		this._color = sc;
		this.$element.css("color", sc);
	}

	public get size() {
		return this._fontSize;
	}

	public set size(s: number) {
		this._fontSize = s;
		this.$element.css("font-size", `${s}px`);
	}

	public get font() {
		return this._font;
	}

	public set font(f: string) {
		this._font = f;
		this.$element.css("font-family", f);
	}

	public get text(): string {
		return this.$element.text();
	}

	public set text(s: string) {
		this.$element.text(s);
	}
}

export class TextFactory extends ObjectRecycler<TextDisplay, ITextRequest> {
	public constructor(root: HTMLElement) {
		super(root);
	}

	/**
	 * Changes the requst
	 */
	public addText(textData: Omit<ITextRequest, "type">) {
		this.addRequest(jQuery.extend(true, textData, { type: "text" }));
	}

	protected createObject(root: HTMLElement): TextDisplay {
		return new TextDisplay(root);
	}
}
