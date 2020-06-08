import { ISJSScene, ISJS } from './interfaces/sjs';
import { SpriteWrapper } from "./sprite-wrapper.js";
import { RectFactory } from './rect-factory.js';
import { EllipseFactory } from './ellipse-factory.js';
import { DrawState } from './draw-state.js';
import { TextFactory } from './text-factory.js';
import { IGameInput, createGameInput } from "./game-input.js";

declare var sjs: ISJS;

export class NoWorld {
	private _scene: ISJSScene;
	private $root: JQuery;
	private sceneWidth: number;
	private sceneHeight: number;
	private readonly _startTime: number;
	private _frameCount: number;
	private bg: SpriteWrapper;

	private _rects: RectFactory;

	private _ellipses: EllipseFactory;

	private _text: TextFactory;

	private _drawState: DrawState;

	private _input: IGameInput;


	public constructor(doc: HTMLDocument, private root: string | HTMLElement | JQuery) {
		this._startTime = Date.now();
		this._frameCount = 0;
		this._drawState = new DrawState();
		const $: JQueryStatic = (window as any).jQuery;
		const $root = this.$root = (function() {
			if (!root) {
				return $(doc.body);
			}
			if (typeof root === "object") {
				if (root instanceof HTMLElement) {
					return $(root);
				}
				if (root instanceof jQuery) {
					return root as JQuery;
				}
			}
			const $e: JQuery = $(String(root));
			if ($e.length === 1) {
				return $e;
			}
			return $(doc.body);
		}());
		this.sceneWidth = $root.width() || 400;
		this.sceneHeight = $root.height() || 400;

		this._scene = sjs.Scene({
			w: this.sceneWidth,
			h: this.sceneHeight,
			parent: $root[0]
		});

		this._input = createGameInput();
		this._input.connect($root);

		const bg = this.bg = this.createSprite(0, 0);
		bg.setSize(this.sceneWidth, this.sceneHeight);
		const dom = this._scene.layers["default"].dom;
		this._rects = new RectFactory(dom);
		this._text = new TextFactory(dom);
		this._ellipses = new EllipseFactory(dom);
	}

	public get input(): IGameInput {
		return this._input;
	}

	public preUpdate() {
		this._frameCount++;
		this.drawState.reset();
	}

	public postUpdate() {
		this._rects.update();
		this._ellipses.update();
		this._text.update();
		this._input.update();
	}

	public setBackground(color: string) {
		this.bg.color = color;
	}

	public get rects(): RectFactory {
		return this._rects;
	}

	public get ellipses(): EllipseFactory {
		return this._ellipses;
	}

	public get text(): TextFactory {
		return this._text;
	}

	public get drawState() {
		return this._drawState;
	}

	public get scene(): ISJSScene {
		return this._scene;
	}

	public createSprite(x: number, y: number): SpriteWrapper {
		return new SpriteWrapper(this._scene, x, y);
	}

	public get width() {
			return this.sceneWidth;
		}

	public get height() {
			return this.sceneHeight;
		}

	public get mouseX() {
			return 0; // TODO
		}
	public get mouseY() {
			return 0; // TODO
		}

	public get frameRate() {
			return 40; // TODO
	}
	public get frameCount() {
		return this._frameCount;
	}

	public get seconds() {
		return (Date.now() - this._startTime) / 1000;
	}
}
