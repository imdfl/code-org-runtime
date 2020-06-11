// TODO replace event which, keyCode with modern equivalent
class GameInput {
    constructor() {
        this.pressedCombinations = {};
        this.map = {};
        this._devices = [];
    }
    static isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    static isArray(a) {
        return Array.isArray(a);
    }
    get $root() {
        return this._$root;
    }
    connect($root, ...devices) {
        this._$root = $root;
        this.initDevices(...devices);
    }
    disconnect() {
        const $body = $(this.$root[0].ownerDocument.body);
        $body.off(".gameinput").off(".gameinputbind");
        this.$root.off(".gameinput").off(".gameinputbind");
    }
    isPressed(combinations) {
        const combs = this.splitCombinations(combinations);
        let c, i, n, j, m, device, combmatch;
        for (i = 0, n = combs.length; i < n; i++) {
            combmatch = true;
            for (j = 0, m = combs[i].length; j < m; j++) {
                c = combs[i][j];
                device = this.findDeviceForSelector(c);
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
        let c, j, m, device, combmatch, anyDown;
        for (let i = 0, n = combs.length; i < n; i++) {
            combmatch = true;
            anyDown = false;
            for (j = 0, m = combs[i].length; j < m; j++) {
                c = combs[i][j];
                device = this.findDeviceForSelector(c);
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
    isUp(combinations) {
        const combs = this.splitCombinations(combinations);
        let c, j, m, device, 
        // anyDown: boolean,
        combmatch, anyUp;
        for (let i = 0, n = combs.length; i < n; i++) {
            combmatch = true;
            // anyDown = false;
            for (j = 0, m = combs[i].length; j < m; j++) {
                c = combs[i][j];
                device = this.findDeviceForSelector(c);
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
    getGamepads() {
        const navany = navigator;
        return navigator.getGamepads && navigator.getGamepads()
            || navany.webkitGetGamepads && navany.webkitGetGamepads()
            || navany.webkitGamepads;
    }
    splitCombinations(combinations) {
        const combArray = combinations.split(" ");
        const c = [];
        for (let i = 0, n = combArray.length; i < n; i++) {
            c.push(this.splitCombination(combArray[i]));
        }
        return c;
    }
    splitCombination(combination) {
        return combination.split("+");
    }
    // getCodes(name: string, device: string) {
    // 	return this.devices[device].getCodes(name);
    // }
    bind(comb, callback, preventRepeat = true) {
        const fndown = function (e) {
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
            const fnup = function (e) {
                this.pressedCombinations[comb] = false;
            }.bind(this);
            this._$root.on("keyup.gameinputbind", fnup);
            document.addEventListener("mouseup.gameinputbind", fnup);
        }
    }
    setupNextFrame() {
        for (const d of this._devices) {
            d.setupNextFrame();
        }
    }
    initDevices(...devices) {
        let map = {};
        if (devices && devices.length) {
            devices.forEach(d => { map[d] = true; });
        }
        else {
            map = { gamepad: true, mouse: true, keyboard: true };
        }
        if ("gamepad" in map) {
            this._devices.push(new NOGamePad(this));
        }
        if ("mouse" in map) {
            this._devices.push(new NOMouse(this));
        }
        if ("keyboard" in map) {
            this._devices.push(new NOKeyboard(this));
        }
    }
    findDeviceForSelector(s) {
        for (const d of this._devices) {
            if (d.isMine(s)) {
                return d;
            }
        }
        return null;
    }
}
GameInput.REVISION = 2;
class NOGamePad {
    constructor(input) {
        this.map = {
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
        this._gameInput = input;
    }
    isMine(name) {
        return name.substr(0, 7) === "gamepad";
    }
    getCodes(name) {
    }
    isPressed(name) {
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
    getAxis(name) {
        const gpdesc = this.getGamepadButtonDescription(name);
        const pad = this._gameInput.getGamepads()[gpdesc.gamepad];
        if (pad) {
            return pad.axes[gpdesc.num];
        }
        else {
            return 0;
        }
    }
    getGamepadButtonDescription(name) {
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
    setupNextFrame() {
    }
}
NOGamePad.GAMEPAD_ANALOGUE_THRESHOLD = 0.5;
class NOKeyboard {
    constructor(input) {
        this.down = {};
        this.up = {};
        this._input = input;
        const $body = $(this._input.$root[0].ownerDocument.body);
        $body.on("keydown.gameinput", this._manageKeyDown.bind(this));
        $body.on("keyup.gameinput", this._manageKeyUp.bind(this));
    }
    isMine(name) {
        return NOKeyboard.map[name] !== undefined;
    }
    /**
     * Returns an array of the keycodes represented by name
     */
    getCodes(name) {
        const v = NOKeyboard.map[name];
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
    isPressed(name) {
        const codes = this.getCodes(name);
        for (let i = 0, n = codes.length; i < n; i++) {
            if (this.down[codes[i]]) {
                return true;
            }
        }
        return false;
    }
    getDown(name) {
        const codes = this.getCodes(name);
        for (let i = 0, n = codes.length; i < n; i++) {
            if (this.down[codes[i]] === 1) {
                return true;
            }
        }
        return false;
    }
    getUp(name) {
        const codes = this.getCodes(name);
        for (let i = 0, n = codes.length; i < n; i++) {
            if (this.up[codes[i]]) {
                return true;
            }
        }
        return false;
    }
    setupNextFrame() {
        Object.keys(this.up).forEach(key => {
            if (this.up[key] >= 2) {
                this.up[key] = 0;
            }
        });
    }
    _manageKeyDown(event) {
        const code = event.which || event.keyCode;
        if (!this.down[code]) {
            this.down[code] = 1;
        }
        else {
            this.down[code]++;
        }
    }
    _manageKeyUp(event) {
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
NOKeyboard.map = {
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
class NOMouse {
    constructor(input) {
        this.down = {};
        this.up = {};
        this.frameMove = false;
        this._input = input;
        this._input.$root.on("mousedown.gameinput", this._manageMouseDown.bind(this));
        this._input.$root.on("mouseup.gameinput", this._manageMouseUp.bind(this));
        this._input.$root.on("mousemoved.gameinput", this._manageMouseMove.bind(this));
    }
    static getButtonName(name) {
        if (!name) {
            return "";
        }
        if (name in NOMouse.map) {
            return name;
        }
        name = (name || "").toLowerCase();
        return NOMouse.selectorMap[name] || name;
    }
    isMine(name) {
        return NOMouse.map[NOMouse.getButtonName(name)] !== undefined;
    }
    getCodes(name) {
        const v = NOMouse.map[NOMouse.getButtonName(name)];
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
            throw new Error("Mouse button " + name + " unknown");
        }
    }
    justMoved() {
        return this.frameMove;
    }
    isPressed(name) {
        const codes = this.getCodes(name);
        for (let i = 0, n = codes.length; i < n; i++) {
            if (this.down[codes[i]]) {
                return true;
            }
        }
        return false;
    }
    getDown(name) {
        const codes = this.getCodes(name);
        for (let i = 0, n = codes.length; i < n; i++) {
            if (this.down[codes[i]] === 1) {
                return true;
            }
        }
        return false;
    }
    getUp(name) {
        const codes = this.getCodes(name);
        for (let i = 0, n = codes.length; i < n; i++) {
            if (this.up[codes[i]]) {
                return true;
            }
        }
        return false;
    }
    _manageMouseDown(event) {
        const code = event.button;
        if (!this.down[code]) {
            this.down[code] = 1;
        }
        else {
            this.down[code]++;
        }
        this.up[code] = 0;
    }
    _manageMouseUp(event) {
        const code = event.button;
        if (!this.up[code]) {
            this.up[code] = 1;
        }
        else {
            this.up[code]++;
        }
        this.down[code] = 0;
    }
    _manageMouseMove(event) {
        this.frameMove = true;
    }
    setupNextFrame() {
        this.frameMove = false;
        this.up = {};
    }
}
NOMouse.map = {
    mouseleft: 0,
    mousecenter: 1,
    mouseright: 2,
    mousecentre: 'mousecenter',
    click: ['mouseleft', 'mouseright', 'mousecenter']
};
NOMouse.selectorMap = {
    leftbutton: "mouseleft",
    rightbutton: "mouseright"
};
export const createGameInput = () => {
    return new GameInput();
};
//# sourceMappingURL=game-input.js.map