/**
 * TS Interfaces for Sprites.js (not spritesjs)
 * https://spritejs.readthedocs.io/en/latest/
 * https://github.com/batiste/sprite.js
 */

export type SJSImageCallback = () => any;
export type SJSTickCallback = (ticker: ISJSTicker) => any;

export interface ISJSSceneOptions {
	parent: Element;

	w: number;
	h: number;
	autoPause: boolean;
}

export interface ISJSTicker {
	/**
	 * lastTicksElapsed is the number of ticks elapsed during two runs of the paint function.
	 * If performances are good the value should be 1. If the number is higher than 1,
	 * it means that there have been more game ticks than calls to the paint function since the last time paint was called.
	 * In essence, there were dropped frames.
	 * The game loop can use the tick count to make sure that it’s physics end up in the right state, regardless of what has been rendered.
	 */
	readonly lastTicksElapsed: number;

	readonly currentTick: number;

	readonly load: number;
	/**
	 * Start the ticker.
	 */
	run(): any;
	/**
	 * Pause the ticker.
	 */
	pause(): any;

	/**
	 * Resume after a pause.
	 */
	resume(): any;

}

export interface ISJSSprite {

	/**
	 * The horizontal position of the sprite as measured against the top left corner of the scene.
	 */
	readonly x: number;
	/**
	 * The vertical position of the sprite as measured top left corder of the scene.
	 */
	readonly y: number;

	/**
	 * Controls the horizontal visible surface of the image.
	 * To have a repeating sprite background you can set the width or height value bigger than the size of the image.
	 */
	readonly w: number;


	/**
	 * Controls the vertical visible surface of the image.
	 */
	readonly h: number;

	/**
	 * The horizontal offset within the sprite’s image from where to start painting the sprite’s surface.
	 */
	readonly xoffset: number;

	/**
	 * The verical offset within the sprite’s from where to start painting the sprite’s surface.
	 */
	readonly yoffset: number;

	/**
	 * Horizontal scaling.
	 */
	readonly xscale: number;

	/**
	 * Vertical scaling.
	 */
	readonly yscale: number;

	/**
	 * Rotation of the sprite in radians.
	 */
	readonly angle: number;

	/**
	 * Background color of the sprite. Use the rgb/hexadecimal CSS notation.
	 */
	readonly color: string;

	/**
	 * Horizontal velocity.
	 */
	xv: number;

	/**
	 * Vertical velocity.
	 */
	yv: number;
	/**
	 * Radial velocity.
	 */
	rv: number;

	readonly img: HTMLImageElement;

	readonly dom: HTMLElement;

	/**
	 * Apply the latest changes to the sprite’s layer.
	 */
	update(): any;

	/**
	 * Change the image sprite.
	 * @param source new image source.
	 * @param resetSize if true the size of the sprite will be reset by the new image.
	 */
	loadImg(source: string, resetSize?: boolean): any;
	/**
	 * Remove the DOM element if the HTML engine is used and enable the garbage collection of the object.
	 */
	remove(): any;

	/**
	 * With a canvas engine, the surface will be automatically cleared before each game tick.
	 * You will need to call update to draw the sprite on the canvas again.
	 * If you don’t want to do this you can set the layer autoClear attribute to false.
	 */
	canvasUpdate(layer: ISJSLayer): any;

	setX(x): number;

	setY(y): number;

	setW(w): number;

	setH(h): number;

	setXOffset(x): number;

	setYOffset(y): number;

	setXScale(xscale): number;

	setYScale(yscale): number;

	setAngle(radian): number;

	/**
	 * E.g.  sprite.setColor("#333")
	 * @param color string
	 */
	setColor(color: string): number;

	/**
	 * 0 to 1 opacity
	 * @param opacity new opacity
	 */
	setOpacity(opacity: number): number;

	/**
	 * e.g. sprite.setBackgroundRepeat("repeat-y")
	 */
	setBackgroundRepeat(repeat: string): any;


	rotate(radians): any;

	/**
	 * If y is not defined, y will take the same value as x.
	 */
	scale(xOrAllscale: number, yscale?: number): any;

	/**
	 * Move the sprite in the direction of the VECTOR (x, y): number; argument.
	 */
	move(x: number, y: number): ISJSSprite;

	/**
	 * Set the position of the sprite (left, top): number;
	 */
	position(x: number, y: number): ISJSSprite;

	offset(x: number, y: number): ISJSSprite;

	size(x: number, y: number): ISJSSprite;



	/**
	 * Apply all velocities on the current Sprite.
	 */
	applyVelocity(): any;

	/**
	 * Reverse all velocities on the current Sprite.
	 */
	reverseVelocity(): any;


	/**
	 * Apply the horizontal xv velocity.
	 */
	applyXVelocity(): any;


	/**
	 * Apply the vertical yv velocity.
	 */
	applyYVelocity(): any;

	/**
	 * Apply the horizontal xv velocity negatively.
	 */
	reverseXVelocity(): any;

	/**
	 * Apply the vertical yv velocity negatively.
	 */
	reverseYVelocity(): any;

	/**
	 * Rotate the velocity vector according to the provided angle.
	 */
	rotateVelocity(angle: number): any;


	/**
	 * Point the velocity vector in the direction of the point (x, y). The velocity intensity remains unchanged.
	 */
	orientVelocity(x: number, y: number): any;

	/**
	 * Returns the distance between the calling sprite’s center and it’s argument sprites center.
	 */
	distance(sprite: ISJSSprite): number;

	/**
	 * Return the distance between the sprite’s center and the point (x, y)
	 */
	distance(x: number, y: number): number;

	/**
	 * Returns true if the point (x, y) is within the sprite’s surface.
	 */
	isPointIn(x: number, y: number): boolean;


	/**
	 * Returns true if the sprite is in collision with the passed sprite
	 */
	collidesWith(sprite: ISJSSprite): boolean;

	/**
	 * Searches the passed array of sprites for a colliding sprite. If found, that sprite is returned.
	 */
	collidesWithArray(sprites: Array<ISJSSprite>): boolean;

	/**
	 * Returns an array of two new sprites that are the two parts of the sprite according to the given position.
	 * The default value for position is half the size of the sprite.
	 * Arguments:
	 * @param position    	position (number) – The cut offset / position.
	 * @param horizontal (boolean) – Cut horizontaly if true, verticaly if false.
	 */
	explode2(position?: number, horizontal?: boolean, layer?: ISJSLayer): Array<ISJSSprite>;

	/**
	 * Return an array of four new sprites that are the split from the center (x, y). The default value for (x, y) is the center of the sprite.
	 * x (number) – The x position where to cute.
	 * y (number) – The y position where to cute.
	 * layer (Layer) – the Layer where to create the new Sprites, default being the current sprite’s Layer.
	 */
	explode4(x?: number, y?: number, layer?: ISJSLayer): any;

	setVisible(v: boolean): void;
	isVisible(): boolean;

}

export interface ISJSLayerOptions {

	/**
	 * If true this layer will use the canvas element to draw the sprites. This enables you to mix HTML and canvas.
	 */
	useCanvas: boolean;
	/**
	 * If false this disables the automatic clearing of the canvas before every paint call.
	 */
	autoClear: boolean;
	parent: Element;
}

export interface ISJSLayer {
	readonly dom: HTMLElement;
	Sprite(source?: string, options?: ISJSSpriteOptions): ISJSSprite;
}

export interface ISJSSpriteOptions {
	layer: ISJSLayer;
	color: string;
}

export interface ISJSTickerOptions {

	/**
	 * Duration in milliseconds of each game tick.
	 */
	tickDuration: number;
	useAnimationFrame: boolean;
}

export interface ISJSCycle {
	addSprite(sprite: ISJSSprite): any;
}

export interface ISJSInput {
	readonly up: boolean;
	readonly right: boolean;
	readonly down: boolean;
	readonly enter: boolean;
	readonly space: boolean;
	readonly ctrl: boolean;
	readonly esc: boolean;
}


export interface ISJSScene {
	/**
	 * the dom element of this scene, **Undocumented in sprites.js**
	 */
	// readonly dom: HTMLElement;

	readonly layers: { [name: string]: ISJSLayer };
	/**
	 * Load the given array of image sources. When all images are loaded, the callback is executed.
	 */
	loadImages(images: Array<string>, callback: SJSImageCallback): void;
	/**
	 * Delete all layers present in this scene, delete the sprites and layers, and pause the ticker.
	 */
	reset(): void;

	/**
	 *  Create a Layer object, see the Layer section.
	 */
	Layer(name: string, options: Partial<ISJSLayerOptions>): ISJSLayerOptions;

	/**
	 *  Create a Sprite object, see the Sprite section.
	 */
	Sprite(source?: string, layer?: ISJSLayer, options?: Partial<ISJSSpriteOptions>): ISJSSprite;
	/**
	 *  Create a Ticker object for this scene or reset the previous one.
	 */
	Ticker(paint: SJSTickCallback, options?: Partial<ISJSTickerOptions>): ISJSTicker;

	/**
	 *   Alias for sjs.Cycle, see the Cycle section.
	 */
	Cycle(triplets: Array<any>): ISJSCycle;
}


/**
 * In order to make imports simpler, **PLEASE** declare a var of this type in your most global context
 * declare var sjs: ISJS;
 */
export interface ISJS {
	Scene(options: Partial<ISJSSceneOptions>): ISJSScene;
}

