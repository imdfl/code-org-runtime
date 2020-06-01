export class DrawState {
    constructor() {
        this.reset();
    }
    reset() {
        this.fillColor = "black";
        this.strokeWeight = 1;
        this.textFont = "inherit";
        this.textSize = 12;
        this._strokeColor = "black";
    }
    get strokeColor() {
        return this.strokeWeight > 0 ? this._strokeColor : "transparent";
    }
    set strokeColor(c) {
        this._strokeColor = c;
    }
}
//# sourceMappingURL=draw-state.js.map