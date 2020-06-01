import { ISJSTicker } from '../emulator/interfaces/sjs';
import { SpriteWrapper } from '../emulator/sprite-wrapper.js';
import { NoWorld } from "../emulator/no-world.js";

type AnyFunction = (...args: any[]) => any;

$(() => {

	const World = new NoWorld("#sandbox");

	/**
	 * Scene background sprite
	 */


	function log(...args: any[]) {
		console.log.apply(console, args);
	}

	function fill(color: string) {
		World.drawState.fillColor = color;
		// TODO
	}

	function noFill() {
		World.drawState.fillColor = null;
	}

	function stroke(color: string) {
		World.drawState.strokeColor = color;
	}

	function noStroke() {
		World.drawState.strokeColor = null;
	}

	function playSound(url: string, repeat: boolean = false) {
		log("playsound", url, repeat);
	}

	function createSprite(x: number, y: number): any {
		return World.createSprite(x, y);
	}

	function background(color: string) {
		World.setBackground(color);
	}

	function keyWentDown(key: string): boolean {
		return false;
		// TODO
	}

	function keyWentUp(key: string): boolean {
		return false;
		// TODO
	}

	function keyDown(key: string): boolean {
		return false;
		// TODO
	}

	function mouseWentDown(button: string): boolean {
		return false;
	}

	function mousePressedOver(sprite: SpriteWrapper): boolean {
		return false;
	}

	function mouseIsOver(sprite: SpriteWrapper): boolean {
		return false; // TODO
	}

	function drawSprites() {
		SpriteWrapper.updateSprites();
	}

	function getKeyValue(key: string, callback: AnyFunction): string {
		return null;
	}

	function setKeyValue(key: string, value: any, callback: AnyFunction): void {

	}

	function randomNumber(min: number, max: number): number {
		if (min > max) {
			const t = min; min = max; max = t;
		}
		const range = max - min;
		if (range === 0) {
			return min;
		}
		return min + Math.round(Math.random() * range);
	}

	function text(txt: any, x: number, y: number, ...args: any[]): void {
		// const text = String(txt);
	}

	function rect(x: number, y: number, width: number, height: number) {
		const d = World.drawState;
		World.rects.addRect({
			x, y, width, height, strokeColor: d.strokeColor, strokeWeight: d.strokeWeight,
			fillColor: d.fillColor
		});
	}

	function ellipse(x: number, y: number, width: number, height: number) {
		// TODO
	}

	function textSize(size: number): void {

	}

	function paint(t: ISJSTicker): void {
		try {
			const f = eval("draw");
			if (typeof f === "function") {
				World.preUpdate();
				f();
				World.postUpdate();
			}
		}
		catch (e) {
		}
	}


	const ticker = World.scene.Ticker(paint);
	ticker.run();


	/************************* Begin client code ****************************** */

	var x = 4, y = 5;
	function draw() {
		rect(x++, y++, 20, 30);
	}



});
