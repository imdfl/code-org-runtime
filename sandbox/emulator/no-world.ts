import { ISJSScene, ISJS } from './interfaces/sjs';
import { SpriteWrapper } from "./sprite-wrapper.js";
import { RectFactory } from './rect-factory.js';
import { DrawState } from './draw-state.js';

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

	private _drawState: DrawState;


	public constructor(private root: any) {
		this._startTime = Date.now();
		this._frameCount = 0;
		this._drawState = new DrawState();
		const $: JQueryStatic = (window as any).jQuery;
		const $root = this.$root = (function() {
			if (!root) {
				return $(document.body);
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
			return $(document.body);
		}());
		this.sceneWidth = $root.width() || 400;
		this.sceneHeight = $root.height() || 400;

		this._scene = sjs.Scene({
			w: this.sceneWidth,
			h: this.sceneHeight,
			parent: $root[0]
		});

		const bg = this.bg = this.createSprite(0, 0);
		bg.setSize(this.sceneWidth, this.sceneHeight);
		this._rects = new RectFactory(this.scene.dom);
	}

	public preUpdate() {
		this._frameCount++;
	}

	public postUpdate() {
		this._rects.update();
	}

	public setBackground(color: string) {
		this.bg.color = color;
	}

	public get rects(): RectFactory {
		return this._rects;
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
