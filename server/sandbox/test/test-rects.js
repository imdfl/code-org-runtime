import { SpriteWrapper } from '../emulator/sprite-wrapper.js';
import { NoWorld } from "../emulator/no-world.js";
$(() => {
    const World = new NoWorld("#sandbox");
    function log(...args) {
        console.log.apply(console, args);
    }
    function fill(color) {
        World.drawState.fillColor = color;
        // TODO
    }
    function noFill() {
        World.drawState.fillColor = "transparent";
    }
    function stroke(color) {
        World.drawState.strokeColor = color;
    }
    function noStroke() {
        World.drawState.strokeWeight = 0;
    }
    function strokeWeight(weight) {
        World.drawState.strokeWeight = weight;
    }
    function playSound(url, repeat = false) {
        log("playsound", url, repeat);
    }
    function createSprite(x, y) {
        return World.createSprite(x, y);
    }
    function background(color) {
        World.setBackground(color);
    }
    function keyWentDown(key) {
        return false;
        // TODO
    }
    function keyWentUp(key) {
        return false;
        // TODO
    }
    function keyDown(key) {
        return false;
        // TODO
    }
    function mouseWentDown(button) {
        return false;
    }
    function mousePressedOver(sprite) {
        return false;
    }
    function mouseIsOver(sprite) {
        return false; // TODO
    }
    function drawSprites() {
        SpriteWrapper.updateSprites();
    }
    function getKeyValue(key, callback) {
        return null;
    }
    function setKeyValue(key, value, callback) {
    }
    function randomNumber(min, max) {
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
    function text(txt, x, y, ...args) {
        World.text.addText({
            text: String(txt),
            x,
            y,
            color: World.drawState.fillColor,
            size: World.drawState.textSize,
            font: World.drawState.textFont
        });
    }
    function rect(x, y, width, height) {
        const d = World.drawState;
        World.rects.addRect({
            x, y, width, height, strokeColor: d.strokeColor, strokeWeight: d.strokeWeight,
            fillColor: d.fillColor
        });
    }
    function ellipse(x, y, width, height) {
        const d = World.drawState;
        World.ellipses.addEllipse({
            x, y, width, height, strokeColor: d.strokeColor, strokeWeight: d.strokeWeight,
            fillColor: d.fillColor
        });
    }
    function textSize(size) {
        World.drawState.textSize = size;
    }
    function textFont(font) {
        World.drawState.textFont = font;
    }
    function paint(t) {
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
//# sourceMappingURL=test-rects.js.map