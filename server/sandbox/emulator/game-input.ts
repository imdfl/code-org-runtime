export type GameInputCallback = (...args: any[]) => any;

export interface IGameInput {
	readonly devices: any;
	readonly pressedCombinations: any;
	readonly $root: JQuery;
	connect($root: JQuery): void;
	disconnect(): void;
	/**
	 * Call at the END of the frame processing
	 */
	update(): void;
	getGamepads(): Gamepad[];
	isDown(combination: string): boolean;
	isPressed(combination: string): boolean;
	isUp(combination: string): boolean;
}

// TODO replace event which, keyCode with modern equivalent

class GameInput implements IGameInput {
	public static readonly REVISION = 2;
	public static $: JQueryStatic;

	public devices: Devices;
	public pressedCombinations: any = {};
	public map: any = {};

	private _$root: JQuery;

	public static isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	public static isArray(a) {
		return Array.isArray(a);
	}

	constructor() {
		this.devices = new Devices();
	}

	public get $root() {
		return this._$root;
	}

	public connect($root: JQuery) {
		this._$root = $root;
		this.devices.init(this);
	}

	public disconnect() {
		const $body = $(this.$root[0].ownerDocument.body);
		$body.off(".gameinput").off(".gameinputbind");
		this.$root.off(".gameinput").off(".gameinputbind");
	}

	isPressed(combinations) {
		const combs = this.splitCombinations(combinations);
		let c,
			i, n,
			j, m,
			device: INOInputDevice,
			combmatch;

		for (i = 0, n = combs.length; i < n; i++) {
			combmatch = true;
			for (j = 0, m = combs[i].length; j < m; j++) {
				c = combs[i][j];
				device = this.devices.findDevice(c);

				if (device == null) {
					return false;
				}

				if (!device.isPressed(c)) {
					combmatch = false;
					break;
				}
			}
			if (combmatch) {
				return true;
			}
		}
		return false;
	}


	isDown(combinations) {
		const combs = this.splitCombinations(combinations);
		let c,
			j, m,
			device: INOInputDevice,
			combmatch,
			anyDown;

		for (let i = 0, n = combs.length; i < n; i++) {
			combmatch = true;
			anyDown = false;
			for (j = 0, m = combs[i].length; j < m; j++) {
				c = combs[i][j];
				device = this.devices.findDevice(c);

				if (!device) {
					return false;
				}
				if (!device.isPressed(c)) {
					combmatch = false;
					break;
				}
				if (device.getDown(c)) {
					anyDown = true;
				}
			}
			if (combmatch && anyDown) {
				return true;
			}
		}
		return false;
	}

	isUp(combinations: string) {
		const combs = this.splitCombinations(combinations);
		let c,
			j, m,
			device: INOInputDevice,
			// anyDown: boolean,
			combmatch,
			anyUp;

		for (let i = 0, n = combs.length; i < n; i++) {
			combmatch = true;
			// anyDown = false;
			for (j = 0, m = combs[i].length; j < m; j++) {
				c = combs[i][j];
				device = this.devices.findDevice(c);

				if (device == null) {
					return false;
				}
				anyUp = device.getUp(c);

				if (!device.isPressed(c) && !anyUp) {
					combmatch = false;
					break;
				}
			}
			if (combmatch && anyUp) {
				return true;
			}
		}
		return false;
	}

	getGamepads(): Gamepad[] {
		const navany = navigator as any;
		return navigator.getGamepads && navigator.getGamepads()
			|| navany.webkitGetGamepads && navany.webkitGetGamepads()
			|| navany.webkitGamepads;
	}


	private splitCombinations(combinations: string) {
		const combArray = combinations.split(" ");
		const c: Array<Array<string>> = [];
		for (let i = 0, n = combArray.length; i < n; i++) {
			c.push(this.splitCombination(combArray[i]));
		}
		return c;
	}

	private splitCombination(combination: string): string[] {
		return combination.split("+");
	}

	getCodes(name: string, device: string) {
		return this.devices[device].getCodes(name);
	}

	bind(comb: string, callback: GameInputCallback, preventRepeat = true) {

		const fndown = function(e) {
			if (this.isPressed(comb) && (!preventRepeat || !this.pressedCombinations[comb])) {
				if (preventRepeat) {
					this.pressedCombinations[comb] = true;
				}
				return callback(e);
			}
		}.bind(this);

		this._$root.on("keydown.gameinputbind", fndown);
		this.$root.on("mousedown.gameinputbind", fndown);

		if (preventRepeat) {
			const fnup = function(e) {
				this.pressedCombinations[comb] = false;
			}.bind(this);

			this._$root.on("keyup.gameinputbind", fnup);
			document.addEventListener("mouseup.gameinputbind", fnup);
		}
	}

	update() {
		this.devices.frameSetup();
	}

}

interface INOInputDevice {
	isPressed(name: string): boolean;
	isMine(combo: string): boolean;
	getDown(combo: string): boolean;
	getUp(combo: string): boolean;
}

class Devices {
	public gamepad: NOGamePad;
	public mouse: NOMouse;
	public keyboard: NOKeyboard;
	constructor() {
		this.gamepad = new NOGamePad();
		this.mouse = new NOMouse();
		this.keyboard = new NOKeyboard();
	}

	public init(input: IGameInput) {
		this.mouse.init(input);
		this.keyboard.init(input);
		this.gamepad.init(input);
	}

	public findDevice(combination: string): INOInputDevice {
		for (const d of [this.mouse, this.keyboard, this.gamepad]) {
			if (d.isMine(combination)) {
				return d;
			}
		}
		return null;
	}

	public frameSetup(): void {
		for (const d of [this.gamepad, this.mouse, this.keyboard]) {
			d.frameSetup();
		}
	}
}

class NOGamePad implements INOInputDevice {
	public static GAMEPAD_ANALOGUE_THRESHOLD = 0.5;
	public map: any = {
		button: {
			1: 0,
			2: 1,
			3: 2,
			4: 3,
			L1: 4,
			R1: 5,
			L2: 6,
			R2: 7,
			select: 8,
			start: 9,
			leftanalogue: 10,
			rightanalogue: 11,
			padup: 12,
			paddown: 13,
			padleft: 14,
			padright: 15
		},
		axis: {
			leftanaloguehor: 0,
			leftanaloguevert: 1,
			rightanaloguehor: 2,
			rightanaloguevert: 3
		}
	};
	private _gameInput: IGameInput;

	constructor() {
	}

	public init(input: IGameInput) {
		this._gameInput = input;
	}

	public isMine(name: string) {
		return name.substr(0, 7) === "gamepad";
	}

	public getCodes(name) {

	}

	public isPressed(name: string) {
		return false;
		// const gpdesc = this.getGamepadButtonDescription(name),
		// 	gptype = (gpdesc.type === "axis") ? "axes" : "buttons",
		// 	gamepads = this._gameInput.getGamepads();
		// return gamepads[gpdesc.gamepad]
		// 	&& gamepads[gpdesc.gamepad][gptype][gpdesc.num]
		// 	&& (gpdesc.type === "button" && gamepads[gpdesc.gamepad][gptype][gpdesc.num].pressed
		// 		|| gpdesc.type === "axis" && Math.abs(gamepads[gpdesc.gamepad][gptype][gpdesc.num]) > NOGamePad.GAMEPAD_ANALOGUE_THRESHOLD);
	}

	getDown(name) {
		return false;
	}

	getUp(name) {
		return false;
	}


	getAxis(name: string) {
		const gpdesc = this.getGamepadButtonDescription(name);
		const pad = this._gameInput.getGamepads()[gpdesc.gamepad];
		if (pad) {
			return pad.axes[gpdesc.num];
		}
		else {
			return 0;
		}
	}

	getGamepadButtonDescription(name: string) {
		const gpcode = name.split("/");
		const gpnum = parseInt(gpcode[0].substr(7)) - 1;
		let gptype, gpbutton;
		if (gpcode.length === 2) {
			gptype = (this.map.button[gpcode[1]] !== undefined) ? "button" : "axis";
			gpbutton = this.map[gptype][gpcode[1]];
		}
		else {
			gptype = gpcode[1];
			gpbutton = parseInt(gpcode[2]) - 1;
		}

		return {
			gamepad: gpnum,
			type: gptype,
			num: gpbutton
		};
	}

	frameSetup() {

	}
}

class NOKeyboard implements INOInputDevice {
	public down = {};
	public up = {};
	public map = {
		backspace: 8, tab: 9, enter: 13, shift: 16, control: 17, alt: 18, capslock: 20, altgr: 225, del: 46,
		pagedown: 33, pageup: 34, end: 35, home: 36,
		left: 37, up: 38, right: 39, down: 40,
		boardplus: 187, numpadplus: 107, plus: ['boardplus', 'numpadplus'],
		boardhyphen: 189, numpadhyphen: 109, hyphen: ['boardhyphen', 'numpadhyphen'], minus: 'hyphen',
		space: 32, leftwindows: 91, rightwindows: 92, windows: ['leftwindows', 'rightwindows'],

		a: 65, b: 66, c: 67, d: 68, e: 69, f: 70, g: 71, h: 72, i: 73, j: 74,
		k: 75, l: 76, m: 77, n: 78, o: 79, p: 80, q: 81, r: 82, s: 83, t: 84,
		u: 85, v: 86, w: 87, x: 88, y: 89, z: 90,

		numpad0: 96, numpad1: 97, numpad2: 98, numpad3: 99, numpad4: 100, numpad5: 101,
		numpad6: 102, numpad7: 103, numpad8: 104, numpad9: 105,
		board0: 48, board1: 49, board2: 50, board3: 51, board4: 52,
		board5: 53, board6: 54, board7: 55, board8: 56, board9: 57,
		0: ['numpad0', 'board0'], 1: ['numpad1', 'board1'], 2: ['numpad2', 'board2'],
		3: ['numpad3', 'board3'], 4: ['numpad4', 'board4'],
		5: ['numpad5', 'board5'], 6: ['numpad6', 'board6'], 7: ['numpad7', 'board7'],
		8: ['numpad8', 'board8'], 9: ['numpad9', 'board9']
	};

	private _input: IGameInput;

	constructor() {
	}

	init(input: IGameInput) {
		this._input = input;
		const $body = $(this._input.$root[0].ownerDocument.body);
		$body.on("keydown.gameinput", this._manageKeyDown.bind(this));
		$body.on("keyup.gameinput", this._manageKeyUp.bind(this));
	}


	isMine(name: string) {
		return this.map[name] !== undefined;
	}

	/**
	 * Returns an array of the keycodes represented by name
	 */
	getCodes(name: string): Array<number> {
		const v = this.map[name];

		if (v !== undefined) {
			if (GameInput.isNumber(v)) {
				return [v];

			}
			else if (typeof v === "string") {
				return this.getCodes(v);

			}
			else if (GameInput.isArray(v)) {
				const codes = [];
				for (let i = 0; i < v.length; i++) {
					codes.push.apply(codes, this.getCodes(v[i]));
				}
				return codes;
			}
		}
		else {
			throw new Error("Key " + name + " unknown");
		}
	}

	isPressed(name: string) {
		const codes = this.getCodes(name);
		for (let i = 0, n = codes.length; i < n; i++) {
			if (this.down[codes[i]]) {
				return true;
			}
		}
		return false;
	}

	getDown(name: string) {
		const codes = this.getCodes(name);
		for (let i = 0, n = codes.length; i < n; i++) {
			if (this.down[codes[i]] === 1) {
				return true;
			}
		}
		return false;
	}

	getUp(name: string) {
		const codes = this.getCodes(name);
		for (let i = 0, n = codes.length; i < n; i++) {
			if (this.up[codes[i]]) {
				return true;
			}
		}
		return false;
	}

	frameSetup() {
		Object.keys(this.up).forEach(key => {
			if (this.up[key] >= 2) {
				this.up[key] = 0;
			}
		});
	}

	_manageKeyDown(event: KeyboardEvent) {
		const code = event.which || event.keyCode;
		if (!this.down[code]) {
			this.down[code] = 1;
		}
		else {
			this.down[code]++;
		}
	}

	_manageKeyUp(event: KeyboardEvent) {
		const code = event.which || event.keyCode;
		if (!this.up[code]) {
			this.up[code] = 1;
		}
		else {
			this.up[code]++;
		}
		this.down[code] = 0;
	}

}

class NOMouse implements INOInputDevice {
	public down = {};
	public up = {};
	public frameMove = false;
	public map = {
		mouseleft: 1,
		mousecenter: 2,
		mouseright: 3,
		mousecentre: 'mousecenter',
		click: ['mouseleft', 'mouseright', 'mousecenter']
	};

	private _input: IGameInput;
	constructor() {
	}

	public init(input: IGameInput) {
		this._input = input;
		this._input.$root.on("mousedown.gameinput", this._manageMouseDown.bind(this));
		this._input.$root.on("mouseup.gameinput", this._manageMouseUp.bind(this));
		this._input.$root.on("mousemoved.gameinput", this._manageMouseMove.bind(this));
	}

	public isMine(name: string) {
		return this.map[name] !== undefined;
	}

	public getCodes(name: string) {
		const v = this.map[name];

		if (v !== undefined) {
			if (GameInput.isNumber(v)) {
				return [v];

			} else if (typeof v === "string") {
				return this.getCodes(v);

			} else if (GameInput.isArray(v)) {
				const codes = [];
				for (let i = 0; i < v.length; i++) {
					codes.push.apply(codes, this.getCodes(v[i]));
				}
				return codes;
			}
		}
		else {
			throw new Error("Mouse button " + name + " unknown");
		}
	}

	public justMoved(): boolean {
		return this.frameMove;
	}

	isPressed(name: string) {
		const codes = this.getCodes(name);
		for (let i = 0, n = codes.length; i < n; i++) {
			if (this.down[codes[i]]) {
				return true;
			}
		}
		return false;
	}

	getDown(name: string) {
		const codes = this.getCodes(name);
		for (let i = 0, n = codes.length; i < n; i++) {
			if (this.down[codes[i]] === 1) {
				return true;
			}
		}
		return false;
	}

	getUp(name: string) {
		const codes = this.getCodes(name);
		for (let i = 0, n = codes.length; i < n; i++) {
			if (this.up[codes[i]]) {
				return true;
			}
		}
		return false;
	}

	_manageMouseDown(event: MouseEvent) {
		const code = event.which;
		if (!this.down[code]) {
			this.down[code] = 1;
		}
		else {
			this.down[code]++;
		}
		this.up[code] = 0;
	}

	_manageMouseUp(event: MouseEvent) {
		const code = event.which;
		if (!this.up[code]) {
			this.down[code] = 1;
		}
		else {
			this.up[code]++;
		}
		this.down[code] = 0;
	}

	_manageMouseMove(event: MouseEvent): void {
		this.frameMove = true;
	}

	frameSetup() {
		this.frameMove = false;
		Object.keys(this.up).forEach(key => {
			if (this.up[key] >= 2) {
				this.up[key] = 0;
			}
		});
	}
}

export const createGameInput = () => {
	return new GameInput();
};
