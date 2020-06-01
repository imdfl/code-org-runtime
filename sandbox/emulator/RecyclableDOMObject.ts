
import { ObjectRecycler, IRecyclableObject, IRecycleRequest, Similarity } from './object-recycler';
import { ISJSScene } from './interfaces/sjs';

export abstract class RecyclableDOMObject implements IRecyclableObject {
	protected $element: JQuery<Element>;

	private _x = 0;
	private _y = 0;

	protected constructor(protected root: HTMLElement) {
		this.$element = jQuery("");
	}

	public abstract compareTo(other: IRecycleRequest): Similarity;


	public applyProperties(props: IRecycleRequest) {
		Object.keys(props).forEach(key => {
			if (key !== "type" && props[key] !== this[key]) {
				this[key] = props[key];
			}
		});
	}

	public dispose(): void {
		this.element = null;
	}

	protected set element(e: Element) {
		const $e = jQuery(e);
		if (!$e.is(this.$element as any)) {
			this.$element.remove();
			this.$element = $e;
			$e.appendTo(this.root);
		}
	}

	public get x(): number {
		return this._x;
	}

	public set x(newx: number) {
		this._x = newx;
		this.$element.css("left", `${newx}px`);
	}

	public get y(): number {
		return this._y;
	}

	public set y(newy: number) {
		this._y = newy;
		this.$element.css("top", `${newy}px`);
	}
}
