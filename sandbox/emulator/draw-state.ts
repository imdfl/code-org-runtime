

export class DrawState {
	public fillColor: string;
	public strokeWeight: number;
	public textFont: string;
	public textSize: number;

	private _strokeColor;

	public constructor() {
		this.reset();
	}

	public reset(): void {
		this.fillColor = "black";
		this.strokeWeight = 1;
		this.textFont = "inherit";
		this.textSize = 12;
		this._strokeColor = "black";
	}

	public get strokeColor() {
		return this.strokeWeight > 0 ? this._strokeColor : "transparent";
	}

	public set strokeColor(c: string) {
		this._strokeColor = c;
	}


}
