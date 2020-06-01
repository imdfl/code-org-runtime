import { SpriteWrapper } from '../emulator/sprite-wrapper.js';
import { NoWorld } from "../emulator/no-world.js";
$(() => {
    const World = new NoWorld("#sandbox");
    /**
     * Scene background sprite
     */
    function log(...args) {
        console.log.apply(console, args);
    }
    function fill(color) {
        World.drawState.fillColor = color;
        // TODO
    }
    function noFill() {
        World.drawState.fillColor = null;
    }
    function stroke(color) {
        World.drawState.strokeColor = color;
    }
    function noStroke() {
        World.drawState.strokeColor = null;
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
        // const text = String(txt);
    }
    function rect(x, y, width, height) {
        const d = World.drawState;
        World.rects.addRect({
            x, y, width, height, strokeColor: d.strokeColor, strokeWeight: d.strokeWeight,
            fillColor: d.fillColor
        });
    }
    function ellipse(x, y, width, height) {
        // TODO
    }
    function textSize(size) {
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
    var x = 4, y = 5;
    function draw() {
        rect(x++, y++, 20, 30);
    }
});
//# sourceMappingURL=test-rects.js.map