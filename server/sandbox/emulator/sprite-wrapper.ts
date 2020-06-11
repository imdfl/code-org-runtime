import { ISJSSprite, ISJSScene } from "./interfaces/sjs";
import { NoWorld } from './no-world';


function eventToButtonName(event: MouseEvent): string {
	if (event.button === 0) {
		return "left";
	}
	if (event.button === 2) {
		return "right";
	}
	if (event.button === 1) {
		return "middle";
	}
}

function addButtonName(current: string, name: string): string {
	if (!current) {
		return name;
	}
	if (!name) {
		return current;
	}
	const parts = current.split(' ');
	for (const part of parts) {
		if (part === name) {
			return current;
		}
	}
	parts.push(name);
	return parts.join(' ');
}

function removeButtonName(current: string, name: string): string {
	if (!current) {
		return name;
	}
	if (!name) {
		return current;
	}
	const parts = current.split(' ');
	const ind = parts.indexOf(name);
	if (ind >= 0) {
		parts.splice(ind, 1);
	}
	return parts.join(' ');
}

export class SpriteWrapper {
	private static readonly _allSprites: Array<SpriteWrapper> = [];
	private sprite: ISJSSprite;
	private _name: string;
	private _width = 0;
	private _height = 0;

	private _isMouseUp = "";
	private _isMouseDown = "";
	private _isPressed = "";
	private _isMouseIn = false;


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

	public static postUpdateSprites(): void {
		for (const s of SpriteWrapper._allSprites) {
			try {
				s.postFrameUpdate();
			}
			catch (e) {
				console.log("update error", e);
			}
		}
	}

	public static spriteFromEvent(event: Event): SpriteWrapper {
		return $(event && event.currentTarget).data("sprite-wrapper");
	}

	public constructor(private world: NoWorld, x: number = 0, y: number) {
		this.sprite = world.scene.Sprite();
		$(this.sprite.dom).data("sprite-wrapper", this);
		this.sprite.setX(x);
		this.sprite.setY(y);
		SpriteWrapper._allSprites.push(this);
	}

	public onMouseUp(event: MouseEvent): void {
		this._isMouseDown = "";
		this._isMouseUp = addButtonName(this._isMouseUp, eventToButtonName(event));
		this._isPressed = "";
	}

	public onMouseEnter(event: MouseEvent): void {
		this._isMouseIn = true;
	}

	public onMouseLeave(event: MouseEvent): void {
		this._isMouseIn = false;
	}

	public onMouseDown(event: MouseEvent): void {
		const name = eventToButtonName(event);
		this._isMouseDown = addButtonName(this._isMouseDown, name);
		this._isMouseUp = "";
		this._isPressed = addButtonName(this._isPressed, name);
	}

	public postFrameUpdate() {
		this._isMouseUp = "";
		this._isMouseDown = "";
	}

	public isMouseOver() {
		return this._isMouseIn;
	}

	/**
	 * Returns true if the specified mouse button was pressed in the last frame on this  sprite
	 * @param button "left", "right" or "middle"
	 */
	public isMouseDown(button: string): boolean {
		button = (button || "").trim().toLowerCase().replace("button", "");
		return this._isMouseDown.indexOf(button) >= 0;
	}

	/**
	 * Returns true if the specified mouse button was depressed in the last frame, after
	 * being pressed down earlier on this  sprite
	 * @param button "left", "right" or "middle"
	 */
	public isMouseUp(button: string) {
		button = (button || "").trim().toLowerCase().replace("button", "");
		return this._isMouseUp.indexOf(button) >= 0;
	}

	/**
	 * Returns true if the specified mouse button is currently pressed after an initial press
	 * on this sprite
	 * @param button "left", "right" or "middle"
	 */
	public isMousePressed(button: string) {
		button = (button || "").trim().toLowerCase().replace("button", "");
		return this._isPressed.indexOf(button) >= 0;
	}

	public get x() {
		return this.sprite.x;
	}

	public set x(newx: number) {
		this.sprite.setX(newx);
	}

	public set visible(v: boolean) {
		this.sprite.setVisible(v);
	}

	public get visible(): boolean {
		return this.sprite.isVisible();
	}

	public get y() {
		return this.sprite.y;
	}

	public set y(newy: number) {
		this.sprite.setY(newy);
	}

	public destroy(): void {
		if (this.sprite) {
			$(this.sprite.dom).data("sprite-wrapper", null);
			this.sprite.remove();
			this.sprite = null;
		}
		const ind = SpriteWrapper._allSprites.indexOf(this);
		if (ind >= 0) {
			SpriteWrapper._allSprites.splice(ind, 1);
		}
	}

	public setAnimation(name: string) {
		const url = this.world.makeSpritePath(name);
		this.world.scene.loadImages([url], () => {
			if (!this.sprite) { // destroyed since we've made the request
				return;
			}
			this.sprite.loadImg(url, false);
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
