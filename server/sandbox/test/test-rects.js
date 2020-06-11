import { createWorld, fill, noStroke, stroke, rect, ellipse, text, textSize, keyDown, drawSprites, mouseWentUp, randomNumber, strokeWeight, mouseDown } from "../emulator/api.js";
(function ($, imagesPath) {
    $(() => {
        const World = createWorld(imagesPath);
        const ticker = World.scene.Ticker(paint);
        ticker.run();
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
        /************************* Begin client code ****************************** */
        let dx = 4, dy = 5;
        const s = World.createSprite(100, 100);
        const s1 = World.createSprite(130, 140);
        s1.setAnimation("enemyBlack3_1.gif");
        s.setAnimation("animation_5");
        function draw() {
            text("rabak", 30, 40);
            fill("blue");
            ellipse(20, 20, 10, 14);
            text("woohoo", 30, 30);
            if (keyDown("space")) {
                textSize(30);
                fill("red");
                text("Man", 200, 200);
            }
            s1.visible = mouseDown("rightButton");
            if (mouseWentUp("leftButton")) {
                let sp = World.createSprite(randomNumber(30, 100), randomNumber(40, 200));
                sp.color = "orange";
                sp.setSize(30, 20);
            }
            drawSprites();
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
}(window.jQuery, "/userimages/nadan"));
//# sourceMappingURL=test-rects.js.map