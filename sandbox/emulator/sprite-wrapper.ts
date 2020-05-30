import { ISJSSprite, ISJSScene } from "./interfaces/sjs";

export class SpriteWrapper {
	private static readonly _allSprites: Array<SpriteWrapper> = [];

	private sprite: ISJSSprite;
	private _name: string;
	private _width = 0;
	private _height = 0;

	public static get allSprites(): Array<SpriteWrapper> {
		return this._allSprites.slice();
	}
	public static updateSprites(): void {
		for (const s of SpriteWrapper._allSprites) {
			try {
				s.sprite.applyVelocity();
				s.sprite.update();
			}
			catch (e) {
				console.log("update error", e);
			}
		}
	}

	public static makeSpriteName(name: string): string {
		name = (name || "").trim().toLowerCase();
		if (!name) {
			return "";
		}
		if (!/\.png$/.test(name)) {
			name += ".png";
		}
		const parts = name.split('/');
		if (parts[0] !== "") {
			parts.splice(0, 0, "");
		}
		if (parts[1] !== "images") {
			parts.splice(1, 0, "images");
		}
		if (parts[2] === name) {
			parts.splice(2, 0, "sprites");
		}
		return parts.join('/');
	}


	public constructor(private scene: ISJSScene, x: number = 0, y: number) {
		this.sprite = scene.Sprite();
		this.sprite.setX(x);
		this.sprite.setY(y);
		SpriteWrapper._allSprites.push(this);
	}

	public get x() {
		return this.sprite.x;
	}

	public set x(newx: number) {
		this.sprite.setX(newx);
	}

	public get y() {
		return this.sprite.y;
	}

	public set y(newy: number) {
		this.sprite.setY(newy);
	}

	public destroy(): void {
		if (this.sprite) {
			this.sprite.remove();
			this.sprite = null;
		}
		const ind = SpriteWrapper._allSprites.indexOf(this);
		if (ind >= 0) {
			SpriteWrapper._allSprites.splice(ind, 1);
		}
	}

	public setAnimation(name: string) {
		this.scene.loadImages([SpriteWrapper.makeSpriteName(name)], () => {
			this.sprite.loadImg(SpriteWrapper.makeSpriteName(name), false);
			const w = this.width || this.sprite.img.width;
			const h = this.height || this.sprite.img.height;
			this.setSize(w, h);
		});
	}

	public isTouching(other: SpriteWrapper): boolean {
		return this.sprite.collidesWith(other.sprite);
	}

	public get color(): string {
		return this.sprite.color;
	}

	public set color(color: string) {
		this.sprite.setColor(color);
	}

	public get name(): string {
		return this._name;
	}

	public set name(n: string) {
		this._name = n || "";
	}
	public get scale(): number {
		return this.sprite.xscale;
	}

	public set scale(s: number) {
		this.sprite.scale(s);
	}

	public set velocityX(v: number) {
		this.sprite.xv = v;
	}

	public get velocityX(): number {
		return this.sprite.xv;
	}

	public set velocityY(v: number) {
		this.sprite.yv = v;
	}

	public get velocityY(): number {
		return this.sprite.yv;
	}

	public set width(w: number) {
		this._width = w;
		this.sprite.size(w, this.height);
	}

	public get width(): number {
		return this._width;
	}

	public get height(): number {
		return this._height;
	}

	public set height(h: number) {
		this._height = h;
		this.sprite.size(this.width, h);
	}

	public setSize(width: number, height: number) {
		this.sprite.size(width, height);
	}

}