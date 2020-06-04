import { ISJSTicker } from '../emulator/interfaces/sjs';
import { SpriteWrapper } from '../emulator/sprite-wrapper.js';
import { NoWorld } from "../emulator/no-world.js";

type AnyFunction = (...args: any[]) => any;

$(() => {

	const World = new NoWorld("#sandbox");

	function log(...args: any[]) {
		console.log.apply(console, args);
	}

	function fill(color: string) {
		World.drawState.fillColor = color;
		// TODO
	}

	function noFill() {
		World.drawState.fillColor = "transparent";
	}

	function stroke(color: string) {
		World.drawState.strokeColor = color;
	}

	function noStroke() {
		World.drawState.strokeWeight = 0;
	}

	function strokeWeight(weight: number) {
		World.drawState.strokeWeight = weight;
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
		World.text.addText({
			text: String(txt),
			x,
			y,
			color: World.drawState.fillColor,
			size: World.drawState.textSize,
			font: World.drawState.textFont
		});
	}

	function rect(x: number, y: number, width: number, height: number) {
		const d = World.drawState;
		World.rects.addRect({
			x, y, width, height, strokeColor: d.strokeColor, strokeWeight: d.strokeWeight,
			fillColor: d.fillColor
		});
	}

	function ellipse(x: number, y: number, width: number, height: number) {
		const d = World.drawState;
		World.ellipses.addEllipse({
			x, y, width, height, strokeColor: d.strokeColor, strokeWeight: d.strokeWeight,
			fillColor: d.fillColor
		});
	}

	function textSize(size: number): void {
		World.drawState.textSize = size;
	}

	function textFont(font: string) {
		World.drawState.textFont = font;
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

	let dx = 4, dy = 5;

	function draw() {
		text("rabak", 30, 40);
		fill("blue");
		ellipse(20, 20, 10, 14);
		text("woohoo", randomNumber(10, 20), randomNumber(30, 40));
		if ((World.frameCount % 60) > 30) {
			textSize(30);
			fill("red");
			text("Man", 200, 200);
		}
	}

	function drawRects() {
		fill("green");
		noStroke();
		rect(dx++, dy++, 20, 30);
		if ((World.frameCount % 60) > 30) {
			fill("red");
			stroke("blue");
			strokeWeight(3);
			rect(randomNumber(10, 30), randomNumber(30, 50), randomNumber(40, 80), randomNumber(30, 90));
		}
	}



});
