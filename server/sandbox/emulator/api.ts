import { ISJSTicker } from '../emulator/interfaces/sjs';
import { SpriteWrapper } from '../emulator/sprite-wrapper.js';
import { NoWorld } from "../emulator/no-world.js";

type AnyFunction = (...args: any[]) => any;

let World: NoWorld;

export function log(...args: any[]) {
	console.log.apply(console, args);
}

export function fill(color: string) {
	World.drawState.fillColor = color;
	// TODO
}

export function noFill() {
	World.drawState.fillColor = "transparent";
}

export function stroke(color: string) {
	World.drawState.strokeColor = color;
}

export function noStroke() {
	World.drawState.strokeWeight = 0;
}

export function strokeWeight(weight: number) {
	World.drawState.strokeWeight = weight;
}

export function playSound(url: string, repeat: boolean = false) {
	log("playsound", url, repeat);
}

export function createSprite(x: number, y: number): any {
	return World.createSprite(x, y);
}

export function background(color: string) {
	World.setBackground(color);
}

export function keyWentDown(key: string): boolean {
	return World.input.isDown(key);
}

export function keyWentUp(key: string): boolean {
	return World.input.isUp(key);
}

export function keyDown(key: string): boolean {
	return World.input.isPressed(key);
}

export function mouseWentDown(button: string): boolean {
	return World.input.isDown(button);
}

export function mouseWentUp(button: string): boolean {
	return World.input.isUp(button);
}

export function mouseDown(button: string): boolean {
	return World.input.isPressed(button);
}

export function mousePressedOver(sprite: SpriteWrapper): boolean {
	return sprite.isMousePressed("left");
}

export function mouseIsOver(sprite: SpriteWrapper): boolean {
	return false; // TODO
}

export function drawSprites() {
	SpriteWrapper.updateSprites();
}

export function getKeyValue(key: string, callback: AnyFunction): string {
	return null;
}

export function setKeyValue(key: string, value: any, callback: AnyFunction): void {

}

export function randomNumber(min: number, max: number): number {
	if (min > max) {
		const t = min; min = max; max = t;
	}
	const range = max - min;
	if (range === 0) {
		return min;
	}
	return min + Math.round(Math.random() * range);
}

export function text(txt: any, x: number, y: number, ...args: any[]): void {
	World.text.addText({
		text: String(txt),
		x,
		y,
		color: World.drawState.fillColor,
		size: World.drawState.textSize,
		font: World.drawState.textFont
	});
}

export function rect(x: number, y: number, width: number, height: number) {
	const d = World.drawState;
	World.rects.addRect({
		x, y, width, height, strokeColor: d.strokeColor, strokeWeight: d.strokeWeight,
		fillColor: d.fillColor
	});
}

export function ellipse(x: number, y: number, width: number, height: number) {
	const d = World.drawState;
	World.ellipses.addEllipse({
		x, y, width, height, strokeColor: d.strokeColor, strokeWeight: d.strokeWeight,
		fillColor: d.fillColor
	});
}

export function textSize(size: number): void {
	World.drawState.textSize = size;
}

export function textFont(font: string) {
	World.drawState.textFont = font;
}

export const createWorld = (imagesPath: string) => {
	World = new NoWorld(document, imagesPath, "#sandbox");
	return World;
};

