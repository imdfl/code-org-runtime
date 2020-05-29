import { sjs } from '../emulator/interfaces/sjs';
export class Tester {
    constructor() {
        this.crates = [];
    }
    run() {
        const scene = this.scene = sjs.Scene({ w: 600, h: 600 });
        scene.loadImages(['img/crate.png'], () => {
            if (window.location.href.indexOf('canvas') != -1) {
                document.getElementById('canvas-mode').style.display = 'none';
            }
            else {
                document.getElementById('html-mode').style.display = 'none';
            }
            this.display = jQuery('#display');
            const bg = scene.Sprite();
            bg.position(0, 600 - 32);
            bg.size(600, 20);
            bg.setColor('#999');
            bg.update();
            this.bg = bg;
            const crates = this.crates = [];
            for (let i = 0; i < 120; i++) {
                const sp = scene.Sprite('img/crate.png');
                sp.move(32 + (i % 12) * 35, (i / 12.0 | 0) * 50);
                sp.update();
                crates.push(sp);
            }
            this.ticker = scene.Ticker(this.paint.bind(this));
            this.ticker.run();
        });
    }
    hasCollision(crate) {
        return (crate.y + 32 > 600 - 32)
            || (crate.collidesWithArray(this.crates));
    }
    paint() {
        this.bg.update();
        const gravity = 0.5;
        const crates = this.crates;
        for (let i = 0; i < crates.length; i++) {
            const crate = crates[i];
            crate.yv += gravity;
            crate.applyYVelocity();
            if (this.hasCollision(crate)) {
                crate.reverseYVelocity();
                crate.yv = 0;
            }
            crate.update();
        }
        if (this.ticker.currentTick % 30 === 0) {
            this.display.text('system load ' + this.ticker.load + '%');
        }
    }
}
//# sourceMappingURL=test-physics.js.map