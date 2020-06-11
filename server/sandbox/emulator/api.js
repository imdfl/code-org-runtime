import { SpriteWrapper } from '../emulator/sprite-wrapper.js';
import { NoWorld } from "../emulator/no-world.js";
let World;
export function log(...args) {
    console.log.apply(console, args);
}
export function fill(color) {
    World.drawState.fillColor = color;
    // TODO
}
export function noFill() {
    World.drawState.fillColor = "transparent";
}
export function stroke(color) {
    World.drawState.strokeColor = color;
}
export function noStroke() {
    World.drawState.strokeWeight = 0;
}
export function strokeWeight(weight) {
    World.drawState.strokeWeight = weight;
}
export function playSound(url, repeat = false) {
    log("playsound", url, repeat);
}
export function createSprite(x, y) {
    return World.createSprite(x, y);
}
export function background(color) {
    World.setBackground(color);
}
export function keyWentDown(key) {
    return World.input.isDown(key);
}
export function keyWentUp(key) {
    return World.input.isUp(key);
}
export function keyDown(key) {
    return World.input.isPressed(key);
}
export function mouseWentDown(button) {
    return World.input.isDown(button);
}
export function mouseWentUp(button) {
    return World.input.isUp(button);
}
export function mouseDown(button) {
    return World.input.isPressed(button);
}
export function mousePressedOver(sprite) {
    return sprite.isMousePressed("left");
}
export function mouseIsOver(sprite) {
    return false; // TODO
}
export function drawSprites() {
    SpriteWrapper.updateSprites();
}
export function getKeyValue(key, callback) {
    return null;
}
export function setKeyValue(key, value, callback) {
}
export function randomNumber(min, max) {
    if (min > max) {
        const t = min;
        min = max;
        max = t;
    }
    const range = max - min;
    if (range === 0) {
        return min;
    }
    return min + Math.round(Math.random() * range);
}
export function text(txt, x, y, ...args) {
    World.text.addText({
        text: String(txt),
        x,
        y,
        color: World.drawState.fillColor,
        size: World.drawState.textSize,
        font: World.drawState.textFont
    });
}
export function rect(x, y, width, height) {
    const d = World.drawState;
    World.rects.addRect({
        x, y, width, height, strokeColor: d.strokeColor, strokeWeight: d.strokeWeight,
        fillColor: d.fillColor
    });
}
export function ellipse(x, y, width, height) {
    const d = World.drawState;
    World.ellipses.addEllipse({
        x, y, width, height, strokeColor: d.strokeColor, strokeWeight: d.strokeWeight,
        fillColor: d.fillColor
    });
}
export function textSize(size) {
    World.drawState.textSize = size;
}
export function textFont(font) {
    World.drawState.textFont = font;
}
export const createWorld = (imagesPath) => {
    World = new NoWorld(document, imagesPath, "#sandbox");
    return World;
};
//# sourceMappingURL=api.js.map