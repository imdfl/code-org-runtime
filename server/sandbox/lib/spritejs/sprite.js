/*
Copyright (c) 2011 Batiste Bieler and contributors,
https://github.com/batiste/sprite.js

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*jslint bitwise: true, undef: true, white: true, maxerr: 50, indent: 4 */

/* Sprite.js v1.2.1
 *
 * coding guideline
 *
 * CamelCase everywhere (I don't like it but it seems to the standard these days).
 * Tabs have to be 4 spaces (python style).
 * If you contribute don't forget to add your name in the AUTHORS file.
 */

(function (global) {

	"use strict";
	var sjs, Sprite, Scene, Layer, Ticker, Ticker_, Cycle, Input, _Input, List,
		doc = global.document,
		// number of sprites
		nb_sprite = 0,
		// number of scenes
		nb_scene = 0,
		// number of cycle
		nb_cycle = 0,
		browser_specific_runned = false,
		// global z-index
		zindex = 1;


	//IE 8 fix help functions
	function _addEventListener(element, type, listener, useCapture) {
		if (element.addEventListener) {
			element.addEventListener(type, listener, useCapture);
		} else if (element.attachEvent) {
			element.attachEvent("on" + type, listener);
		}
	}

	function _removeEventListener(element, type, listener, useCapture) {
		if (element.removeEventListener) {
			element.removeEventListener(type, listener, useCapture);
		} else if (element.detachEvent) {
			element.detachEvent(type, listener);
		}
	}

	function _preventEvent(e) {
		if (e.preventDefault) {
			e.preventDefault();
			e.stopPropagation();
		} else {
			e.returnValue = false;
		}
	}

	// math functions
	function mod(n, base) {
		// strictly positive modulo
		return ((n % base) + base) % base;
	}

	function hypo(x, y) {
		return Math.sqrt(x * x + y * y);
	}

	function normalVector(vx, vy, intensity) {
		var n = hypo(vx, vy);
		if (n === 0) {
			return { x: vx, y: vy };
		}
		if (intensity) {
			return { x: ((vx / n) * intensity), y: ((vy / n) * intensity) };
		}
		return { x: vx / n, y: vy / n };
	}

	function lineSide(ax, ay, bx, by, cx, cy) {
		// return true if the point C is on the right of the line (A, B)
		var v = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
		if (v === 0) {
			return null;
		}
		return v > 0;
	}

	// browser specific feature detection
	function has(el, propList) {
		var prop = propList.shift();
		while (prop) {
			if (typeof el[prop] !== 'undefined') {
				return prop;
			}
			prop = propList.shift();
		}
	}

	function initBrowserSpecific() {
		sjs.tproperty = has(doc.body.style, [
			'transform',
			'webkitTransform',
			'MozTransform',
			'OTransform',
			'msTransform']);

		sjs.requestAnimationFrame = has(global, [
			'requestAnimationFrame',
			'mozRequestAnimationFrame',
			'webkitRequestAnimationFrame',
			'oRequestAnimationFrame',
			'msRequestAnimationFrame']);

		sjs.cancelAnimationFrame = has(global, [
			'cancelAnimationFrame',
			'cancelRequestAnimationFrame',
			'mozCancelAnimationFrame',
			'mozCancelRequestAnimationFrame',
			'webkitCancelAnimationFrame',
			'webkitCancelRequestAnimationFrame',
			'oCancelAnimationFrame',
			'oCancelRequestAnimationFrame',
			'msCancelAnimationFrame',
			'msCancelRequestAnimationFrame']);

		sjs.createEventProperty = has(doc, ['createEvent', 'createEventObject']);
		browser_specific_runned = true;
	}

	function optionValue(options, name, default_value, type) {
		if (options && options[name] !== undefined) {
			if (type === 'int') {
				return options[name] | 0;
			}
			return options[name];
		}
		return default_value;
	}

	function overlay(x, y, w, h) {
		var div = doc.createElement('div'),
			s = div.style;
		s.top = y + 'px';
		s.left = x + 'px';
		s.width = w + 'px';
		s.height = h + 'px';
		s.color = '#fff';
		s.zIndex = 100;
		s.position = 'absolute';
		s.backgroundColor = '#000';
		s.opacity = 0.7;
		return div;
	}

	Scene = function Scene(options) {

		if (this.constructor !== Scene) {
			return new Scene(options);
		}

		if (!browser_specific_runned) {
			initBrowserSpecific();
		}

		this.autoPause = optionValue(options, 'autoPause', true);
		// main function
		this.main = optionValue(options, 'main', function () { });

		var div = doc.createElement('div'), parent;
		div.style.overflow = 'hidden';
		// TODO: detect those features
		// image-rendering: -moz-crisp-edges;
		// ms-interpolation-mode: nearest-neighbor;
		div.style.imageRendering = '-webkit-optimize-contrast';
		div.style.position = 'relative';
		div.className = 'sjs';
		div.id = 'sjs' + nb_scene;
		this.id = nb_scene;
		nb_scene = nb_scene + 1;
		parent = optionValue(options, 'parent', doc.body);
		parent.appendChild(div);
		this.w = optionValue(options, 'w', 480, 'int');
		this.h = optionValue(options, 'h', 320, 'int');
		this.dom = div;
		this.dom.style.width = this.w + 'px';
		this.dom.style.height = this.h + 'px';
		this.layers = {};
		this.ticker = null;
		this.useCanvas = false;

		this.xscale = 1;
		this.yscale = 1;

		// needs to be done after this.useCanvas
		this.Layer("default");
		sjs.scenes.push(this);
		return this;
	};

	Scene.prototype.constructor = Scene;

	Scene.prototype.Sprite = function SceneSprite(options) {
		options = options || {};
		var layer = options.layer || this.layers["default"];
		
		return new Sprite(layer, options);
	};

	Scene.prototype.Layer = function SceneLayer(name, options) {
		return new Layer(this, name, options);
	};

	// just for convenience
	Scene.prototype.Cycle = function SceneCycle(triplets) {
		return new Cycle(triplets);
	};

	Scene.prototype.Input = function SceneInput() {
		this.input = new Input(this);
		return this.input;
	};

	Scene.prototype.scale = function SceneScale(x, y) {
		this.xscale = x;
		this.yscale = y;
		this.dom.style["TransformOrigin"] = "0 0";
		this.dom.style[sjs.tproperty] = "scale(" + x + "," + y + ")";
	};

	Scene.prototype.toString = function () {
		return "Scene(" + String(this.id) + ")";
	};

	Scene.prototype.reset = function reset() {
		var l;
		if (this.ticker) {
			this.ticker.pause();
		}
		for (l in this.layers) {
			if (this.layers.hasOwnProperty(l)) {
				this.layers[l].dom.parentNode.removeChild(this.layers[l].dom);
				delete this.layers[l];
			}
		}
		// remove remaining children
		while (this.dom.childNodes.length >= 1) {
			this.dom.removeChild(this.dom.firstChild);
		}
		this.layers = {};
		this.Layer("default");
	};

	Scene.prototype.Ticker = function Ticker(paint, options) {
		if (this.ticker) {
			this.ticker.pause();
			this.ticker.paint = function () { };
		}
		this.ticker = new Ticker_(this, paint, options);
		return this.ticker;
	};

	Scene.prototype.loadImages = function loadImages(images, callback) {
		// function used to preload the sprite images
		if (!callback) {
			callback = this.main;
		}

		var toLoad = 0, total, img, src, error, scene, i,
			success = [],
			fail = [],
			pending = 0;
		var rec = null;
		var url;
		for (i = 0; i < images.length; i++) {
			url = images[i];
			rec = sjs.spriteCache[url];
			if (rec) {
				if (rec.loading) {
					rec.callbacks.push((function (imageUrl) {
						return function (loaded) {
							if (loaded) {
								success.push(url);
							}
							else {
								fail.push(url);
							}
							if (toLoad === 0 && --pending === 0) {
								callback({ success: success, fail: fail });
							}
						}
					}(url)));
					pending++;
				}
				else if (rec.loaded) {
					success.push(url);
				}
				// otherwise do nothing, toLoad will not increase
			}
			else {
				toLoad += 1;
				sjs.spriteCache[url] = { src: url, loaded: false, loading: false, callbacks: [] };
			}
		}

		if (toLoad === 0) {
			return pending === 0 ? callback({ success: success, fail: fail }) : null;
		}

		total = toLoad;

		scene = this;
		error = false;

		var _loadImg = function (rec) {
			rec.loading = true;
			img = doc.createElement('img');
			rec.img = img;
			_addEventListener(img, 'load', function () {
				rec.loaded = true;
				rec.loading = false;
				success.push(rec.src);
				rec.callbacks.forEach(function (f) { f(true); });
				rec.callbacks = [];
				toLoad -= 1;
				// if (error === false) {
				if (toLoad === 0) {
					callback({ sucess: success, fail: fail });
				}
				// }
			}, false);

			_addEventListener(img, 'error', function () {
				error = true;
				fail.push(rec.src);
				var callbacks = rec.callbacks;
				rec.callbacks = [];
				delete sjs.spriteCache[src];
				callbacks.forEach(function (f) { f(false); });
				if (toLoad === 0) {
					callback({ sucess: success, fail: fail });
				}
				// div.innerHTML = 'Error loading image ' + src;
			}, false);

			img.src = rec.src;
		}

		var nextRec;
		for (src in sjs.spriteCache) {
			if (sjs.spriteCache.hasOwnProperty(src)) {
				nextRec = sjs.spriteCache[src];
				if (!nextRec.loading && !nextRec.loaded) {
					_loadImg(nextRec);
				}
			}
		}
	};

	Sprite = function Sprite(layer, options) {
		layer = layer || (options && options.layer)
		if (!layer || !layer.sprites) {
			throw new Error("sprite constructor must receive a valid layer");
		}
		this.scene = layer.scene;
		this._dirty = {};
		this.changed = false;

		// positions
		this.y = 0;
		this.x = 0;
		this._bounds = { x: 0, y: 0, w: 0, h: 0 };
		this._x_before = 0;
		this._x_rounded = 0;
		this._y_before = 0;
		this._y_rounded = 0;

		//velocity
		this.xv = 0;
		this.yv = 0;
		this.rv = 0;

		this.type = "rectangle";

		// newton
		this.mass = 1;
		this.friction = 0.05;
		// forces
		this.xf = 0;
		this.yf = 0;

		// image
		this.src = null;
		this.img = null;
		this.imgNaturalWidth = 0;
		this.imgNaturalHeight = 0;

		// width and height of the sprite view port
		this.w = 0;
		this.h = 0;

		// offsets of the image within the viewport
		this.xoffset = 0;
		this.yoffset = 0;

		this.dom = null;
		this.cycle = null;

		this.xscale = 1;
		this.yscale = 1;
		this.angle = 0;

		this.xTransformOrigin = 0;
		this.yTransformOrigin = 0;

		this.backgroundRepeat = null;

		this.opacity = 1;
		this.color = false;

		this.id = String(++nb_sprite);

		// necessary to get set
		this.layer = layer;

		this._visible = true;

		options = options || {};

		var map = {
			x: this.setX,
			y: this.setY,
			xoffset: this.setXOffset,
			yoffset: this.setYOffset,
			xscale: this.setXScale,
			yscale: this.setYscale,
		};
		var self = this;
		var setter;
		// this is the messy magic options initializer code
		Object.keys(options).forEach(function(p) {
			var value = options[p];
			var target = self[p];
			if (typeof target === "function") {
				target.apply(self, value);
				return;
			}
			setter = map[String(p).toLowerCase()];
			if (!setter) {
				console.warn("Unknown sprite init prop", p);
				return;
			}
			setter.call(self, value);
			// this is necessary to set cache value properly
		});


		var	d = doc.createElement('div');
		d.style.position = 'absolute';
		d.className = "sjs-sprite";
		this.dom = d;
		this.layer.dom.appendChild(d);

		if (options.src) {
			this.loadImg(src);
		}
		return this;
	};

	Sprite.prototype.constructor = Sprite;

	Sprite.prototype.setVisible = function (v) {
		this._visible = v;
		if (this.dom) {
			this.dom.style.display = v ? "" : "none";
		}
	}

	Sprite.prototype.istVisible = function (v) {
		return this._visible;
	}

	Sprite.prototype.setDirty = function(prop) {
		this._dirty[prop] = true;
		this.changed = true;
	}

	/* boilerplate setter functions */

	Sprite.prototype.setX = function setX(value) {
		this.x = value;
		// this secessary for the physic
		this._x_rounded = value | 0;
		this.setDirty("x");
		return this;
	};

	Sprite.prototype.setY = function setY(value) {
		this.y = value;
		this._y_rounded = value | 0;
		this.setDirty("y");
		return this;
	};

	Sprite.prototype.setW = function setW(value) {
		this.w = value;
		this.setDirty("w");
		return this;
	};

	Sprite.prototype.setH = function setH(value) {
		this.h = value;
		this.setDirty("h");
		return this;
	};

	Sprite.prototype.setXOffset = function setXoffset(value) {
		this.xoffset = value;
		this._dirty.xoffset = true;
		this.changed = true;
		return this;
	};

	Sprite.prototype.setYOffset = function setYoffset(value) {
		this.yoffset = value;
		this._dirty.yoffset = true;
		this.changed = true;
		return this;
	};

	Sprite.prototype.setAngle = function setAngle(value) {
		this.angle = value;
		this._dirty.angle = true;
		this.changed = true;
		return this;
	};

	Sprite.prototype.setColor = function setColor(value) {
		this.color = value;
		this._dirty.color = true;
		this.changed = true;
		return this;
	};

	Sprite.prototype.setOpacity = function setOpacity(value) {
		this.opacity = value;
		this._dirty.opacity = true;
		this.changed = true;
		return this;
	};

	Sprite.prototype.setXScale = function setXscale(value) {
		this.xscale = value;
		this.setDirty("xscale");
		return this;
	};

	Sprite.prototype.setYScale = function setYscale(value) {
		this.yscale = value;
		this.setDirty("yscale");
		return this;
	};

	Sprite.prototype.transformOrigin = function transformOrigin(x, y) {
		this.xTransformOrigin = x;
		this.yTransformOrigin = y;
		this._dirty.transform = true;
		this.changed = true;
		return this;
	};

	Sprite.prototype.setBackgroundRepeat = function setBackgroundRepeat(value) {
		this._dirty.backgroundRepeat = true;
		this.backgroundRepeat = value;
		return this;
	};

	// End of boilerplate setters, start of helpers

	Sprite.prototype.rotate = function (v) {
		this.setAngle(this.angle + v);
		return this;
	};

	Sprite.prototype.orient = function orient(x, y) {
		var a = Math.atan2(y, x);
		this.setAngle(a);
	};

	Sprite.prototype.scale = function (x, y) {
		if (this.xscale !== x) {
			this.setXScale(x);
		}
		if (y === undefined) {
			y = x;
		}
		if (this.yscale !== y) {
			this.setYScale(y);
		}
		return this;
	};

	Sprite.prototype.move = function (x, y) {
		this.setX(this.x + x);
		this.setY(this.y + y);
		return this;
	};

	Sprite.prototype.position = function (x, y) {
		this.setX(x);
		this.setY(y);
		return this;
	};

	Sprite.prototype.offset = function (x, y) {
		this.setXOffset(x);
		this.setYOffset(y);
		return this;
	};

	Sprite.prototype.size = function (w, h) {
		this.setW(w);
		this.setH(h);
		return this;
	};

	Sprite.prototype.toFront = function () {
		this.layer.lastZIndex++;
		return this.setZIndex(this.layer.lastZIndex);
	};

	Sprite.prototype.toBack = function () {
		this.layer.lastZIndex++;
		return this.setZIndex(-this.layer.lastZIndex);
	};

	Sprite.prototype.setZIndex = function (z) {
		if (this.dom && this.layer) {
			this._dirty.zindex = true;
			this.changed = true;
			this.zindex = z;
		}
		return this;
	};

	// Physic

	Sprite.prototype.setForce = function setForce(xf, yf) {
		this.xf = xf;
		this.yf = yf;
	};

	Sprite.prototype.addForce = function addForce(xf, yf) {
		this.xf += xf;
		this.yf += yf;
	};

	Sprite.prototype.applyForce = function applyForce(ticks) {
		if (ticks === undefined) {
			ticks = 1;
		}
		// Integrate newton's laws of motion F = ma => a = F / m
		this.xv -= this.friction * this.xv * this.mass * ticks;
		this.xv += (this.xf / this.mass) * ticks;
		this.yv -= this.friction * this.yv * this.mass * ticks;
		this.yv += (this.yf / this.mass) * ticks;
	};

	Sprite.prototype.velocity = function () {
		return hypo(this.xv, this.yv);
	};

	Sprite.prototype.setVelocity = function (xv, yv) {
		this.xv = xv;
		this.yv = yv;
	};

	Sprite.prototype.addVelocity = function (xv, yv) {
		this.xv += xv;
		this.yv += yv;
	};

	Sprite.prototype.applyVelocity = function (ticks) {
		if (ticks === undefined) {
			ticks = 1;
		}
		if (this.xv !== 0) {
			this.setX(this.x + this.xv * ticks);
		}
		if (this.yv !== 0) {
			this.setY(this.y + this.yv * ticks);
		}
		if (this.rv !== 0) {
			this.setAngle(this.angle + this.rv * ticks);
		}
		return this;
	};

	Sprite.prototype.reverseVelocity = function (ticks) {
		if (ticks === undefined)
			ticks = 1;
		if (this.xv !== 0) {
			this.setX(this.x - this.xv * ticks);
		}
		if (this.yv !== 0) {
			this.setY(this.y - this.yv * ticks);
		}
		if (this.rv !== 0) {
			this.setAngle(this.angle - this.rv * ticks);
		}
		return this;
	};

	Sprite.prototype.applyXVelocity = function (ticks) {
		if (ticks === undefined)
			ticks = 1;
		if (this.xv !== 0) {
			this.setX(this.x + this.xv * ticks);
		}
	};

	Sprite.prototype.reverseXVelocity = function (ticks) {
		if (ticks === undefined)
			ticks = 1;
		if (this.xv !== 0) {
			this.setX(this.x - this.xv * ticks);
		}
	};

	Sprite.prototype.applyYVelocity = function (ticks) {
		if (ticks === undefined)
			ticks = 1;
		if (this.yv !== 0)
			this.setY(this.y + this.yv * ticks);
	};

	Sprite.prototype.reverseYVelocity = function (ticks) {
		if (ticks === undefined)
			ticks = 1;
		if (this.yv !== 0)
			this.setY(this.y - this.yv * ticks);
	};

	Sprite.prototype.rotateVelocity = function (a) {
		var x = this.xv * Math.cos(a) - this.yv * Math.sin(a);
		this.yv = this.xv * Math.sin(a) + this.yv * Math.cos(a);
		this.xv = x;
	};

	Sprite.prototype.orientVelocity = function (x, y) {
		var intensity = hypo(this.xv, this.yv), v;
		v = normalVector(x, y, intensity);
		this.xv = v.x;
		this.yv = v.y;
	};

	Sprite.prototype.remove = function remove() {
		if (this.cycle)
			this.cycle.removeSprite(this);
		if (this.layer) {
			this.layer.dom.removeChild(this.dom);
			this.dom = null;
		}
		if (this.texture)
			this.texture.remove();
		this.texture = null;
		//delete this.layer.sprites[this.layerIndex];
		this.layer = null;
		this.img = null;
	};

	// Update methods

	Sprite.prototype.update = function updateDomProperties() {

		if (this.layer.scene.disableUpdate)
			return this;

		var style = this.dom.style,
			dirty = this._dirty,
			trans;
		// using Math.round to round integers before changing seems to improve a bit performances
		// if (this._x_before !== this._x_rounded) {
		// 	style.left = (this.x | 0) + 'px';
		// }
		// if (this._y_before !== this._y_rounded) {
		// 	style.top = (this.y | 0) + 'px';
		// }

		// cache rounded positions, it's used to avoid unecessary update
		this._x_before = this._x_rounded;
		this._y_before = this._y_rounded;

		if (!this.changed) {
			return this;
		}

		var boundsChanged = (dirty.w || dirty.h || dirty.x || dirty.y || dirty.xscale || dirty.yscale);
		if (boundsChanged) {
			this.calcBounds();
		}

		if (dirty.w) {
			style.width = (Math.round(this.w) | 0) + 'px';
		}
		if (dirty.h) {
			style.height = (Math.round(this.h) | 0) + 'px';
		}
		if (dirty.x) {
			style.left = (Math.round(this.x) | 0) + 'px';
		}
		if (dirty.y) {
			style.top = (Math.round(this.y) | 0) + 'px';
		}

		if (dirty.opacity) {
			if ('opacity' in document.body.style) {
				style.opacity = this.opacity;
			} else {
				style.filter = "alpha(opacity=" + this.opacity * 100 + ")";
			}
		}

		if (dirty.color) {
			style.backgroundColor = this.color;
		}

		if (dirty.zindex) {
			style.zIndex = this.zindex;
		}

		if (dirty.backgroundRepeat) {
			style.backgroundRepeat = this.backgroundRepeat;
		}

		// those transformation have pretty bad perfs implication on Opera,
		// don't update those values if nothing changed
		if (dirty.angle || dirty.xscale || dirty.yscale) {
			var trans = "";
			if (dirty.angle && this.angle !== 0) {
				trans += 'rotate(' + this.angle + 'rad) ';
			}
			if ((dirty.xscale && this.xscale !== 1) || 
				(dirty.yscale || this.yscale !== 1)) {
					trans += ["scale(",this.xscale, ',', this.yscale, ") "].join('');
			}
			style[sjs.tproperty] = trans;
		}

		if (dirty.image) {
			style.backgroundImage = this.img ? 'url(' + this.img.src + ')' : "none";
			style["TransformOrigin"] = this.img ? "center center" : "0 0";
			style.backgroundRepeat = "no-repeat";
			style.backgroundSize = "100% 100%";
		}

		// reset
		this.changed = false;
		this._dirty = {};
		return this;
	};

	Sprite.prototype.getBoundsRect = function () {
		return this._bounds;
	}


	Sprite.prototype.calcBounds = function () {
		var bounds = {
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h
		};
		var diff;
		if (this.xscale !== 1) {
			diff = (bounds.w - bounds.w * this.xscale);
			bounds.w -= diff;
			bounds.x += diff / 2;
		}
		if (this.yscale !== 1) {
			diff = (bounds.h - bounds.h * this.yscale);
			bounds.h -= diff;
			bounds.y += diff / 2;
		}
		return this._bounds = bounds;
	}
	// Other methods

	Sprite.prototype.toString = function () {
		return ["<Sprite> id: ", this.id, this.img ? ("image: " + this.img.src): ""].join(' ');
	};

	Sprite.prototype.onload = function (callback) {
		if (this.imgLoaded && this._callback) {
			this._callback = callback;
		}
	};


	Sprite.prototype.loadImg = function (src, resetSize) {
		// the image exact source value will change according to the
		// hostname, this is useful to retain the original source value here.
		var _loaded, self = this, img;
		this.src = src;
		// check if the image is already in the cache
		// if (!sjs.spriteCache[src]) {
		// 	// if not we create the image in the cache
		// 	this.img = doc.createElement('img');
		// 	sjs.spriteCache[src] = { src: src, img: this.img, loaded: false, loading: true };
		// 	_loaded = false;
		// } else {
			// if it's already there, we set img object and check if it's loaded
			this.img = sjs.spriteCache[src].img;
			_loaded = sjs.spriteCache[src].loaded;
		// }

		// actions to perform when the image is loaded
		function imageReady(e) {
			img = self.img;
			sjs.spriteCache[src].loaded = true;
			self.imgLoaded = true;
			self._dirty.image = true;
			self.imgNaturalWidth = img.width;
			self.imgNaturalHeight = img.height;
			if (!self.w || resetSize) {
				self.setW(img.width);
			}
			if (!self.h || resetSize) {
				self.setH(img.height);
			}
			self.onload();
		}
		if (_loaded) {
			imageReady();
		}
		else {
			_addEventListener(this.img, 'load', imageReady, false);
			this.img.src = src;
		}
		return this;
	};

	Sprite.prototype.distance = function distance(x, y) {
		var bounds = this.getBoundsRect();
		// Return the distance between this sprite and the point (x, y) or a Sprite
		if (typeof x === "number") {
			return Math.sqrt(Math.pow(bounds.x + bounds.w / 2 - x, 2) +
				Math.pow(bounds.y + bounds.h / 2 - y, 2));
		} else {
			var other = x.getBoundsRect();
			return Math.sqrt(Math.pow(bounds.x + (bounds.w / 2) - (other.x + (other.w / 2)), 2) +
				Math.pow(bounds.y + (bounds.h / 2) - (other.y + (other.h / 2)), 2));
		}
	};

	Sprite.prototype.center = function center() {
		var bounds = this.getBoundsRect();
		return { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 };
	};

	// Fx

	Sprite.prototype.explode2 = function explode(v, horizontal, layer) {
		layer = layer || this.layer;
		var props = { layer: layer, color: this.color, src: this.src };
		var bounds = this.getBoundsRect();
		if (v === undefined) {
			if (horizontal)
				v = bounds.h >> 1;
			else
				v = bounds.w >> 1;
		}
		var s1 = layer.Sprite(props);
		var s2 = layer.Sprite(props);
		if (horizontal) {
			s1.size(bounds.w, v);
			s1.position(bounds.x, this.y);
			s2.size(bounds.w, bounds.h - v);
			s2.position(this.x, this.y + v);
			s2.setYOffset(v);
		} else {
			s1.size(v, bounds.h);
			s1.position(bounds.x, bounds.y);
			s2.size(bounds.w - v, bounds.h);
			s2.position(bounds.x + v, bounds.y);
			s2.setXOffset(v);
		}
		return [s1, s2];
	};

	Sprite.prototype.explode4 = function explode(x, y, layer) {
		var bounds = this.getBoundsRect();
		if (x === undefined)
			x = bounds.w >> 1;
		if (y === undefined)
			y = bounds.h >> 1;
		layer = layer || this.layer;
		var props = { layer: layer, color: this.color, src: this.src };
		// top left sprite, going counterclockwise
		var s1 = layer.Sprite(props),
			s2 = layer.Sprite(props),
			s3 = layer.Sprite(props),
			s4 = layer.Sprite(props);

		s1.size(x, y);
		s1.position(bounds.x, bounds.y);

		s2.size(bounds.w - x, y);
		s2.position(bounds.x + x, bounds.y);
		s2.offset(x, 0);

		s3.size(bounds.w - x, bounds.h - y);
		s3.position(bounds.x + x, bounds.y + y);
		s3.offset(x, y);

		s4.size(x, bounds.h - y);
		s4.position(bounds.x, bounds.y + y);
		s4.offset(0, y);

		return [s1, s2, s3, s4];
	};

	Cycle = function Cycle(triplets) {

		if (this.constructor !== Cycle) {
			return new Cycle(triplets);
		}

		var i, triplet;

		// Cycle for the Sprite image.
		// A cycle is a list of triplet (x offset, y offset, game tick duration)
		this.triplets = triplets;
		// total duration of the animation in ticks
		this.cycleDuration = 0;
		// this array knows on which ticks in the animation
		// an image change is needed
		this.changingTicks = triplets.map(function (triplet) {
			this.cycleDuration += triplet[2];
			return this.cycleDuration;
		}, this);
		this.changingTicks.unshift(0);
		this.currentTripletIndex = undefined;
		// suppose to be private
		this.sprites = [];
		// if set to false, the animation will stop automaticaly after one run
		this.repeat = true;
		this.tick = 0;
		this.done = false;
		this.id = ++nb_cycle;
	};

	Cycle.prototype.addSprite = function addSprite(sprite) {
		this.sprites.push(sprite);
		sprite.cycle = this;
		return this;
	};

	Cycle.prototype.toString = function () {
		return "Cycle(" + String(this.id) + ")";
	};

	Cycle.prototype.update = function update() {
		var sprites = this.sprites, i, sp;
		for (i = 0; sp = sprites[i]; i++) {
			sp.update();
		}
		return this;
	};

	Cycle.prototype.addSprites = function addSprites(sprites) {
		this.sprites = this.sprites.concat(sprites);
		var j, sp;
		for (j = 0; sp = sprites[j]; j++) {
			sp.cycle = this;
		}
		return this;
	};

	Cycle.prototype.removeSprite = function removeSprite(sprite) {
		var j, sp;
		for (j = 0; sp = this.sprites[j]; j++) {
			if (sprite == sp) {
				sp.cycle = null;
				this.sprites.splice(j, 1);
			}
		}
		return this;
	};

	Cycle.prototype.next = function (ticks, update) {
		if (this.tick > this.cycleDuration) {
			if (this.repeat)
				this.tick = 0;
			else {
				this.done = true;
				return this;
			}
		}
		// search the current triplet index
		var currentTripletIndex, i, j, sprite, next;
		for (i = 0; i < this.changingTicks.length; i++) {
			next = this.changingTicks[i + 1];
			if (this.tick >= this.changingTicks[i]) {
				if (next === undefined) {
					currentTripletIndex = 0;
					this.tick = 0;
					break;
				} else if (this.tick < next) {
					currentTripletIndex = i;
					break;
				}
			}
		}
		if (currentTripletIndex !== undefined && currentTripletIndex !== this.currentTripletIndex) {
			this.sprites.map(function (sprite) {
				sprite.setXOffset(this.triplets[currentTripletIndex][0]);
				sprite.setYOffset(this.triplets[currentTripletIndex][1]);
				if (update) {
					sprite.update();
				}
			}.bind(this));
			this.currentTripletIndex = currentTripletIndex;
		}

		ticks = ticks || 1; // default tick: 1
		this.tick = this.tick + ticks;
		return this;
	};

	Cycle.prototype.reset = function resetCycle(update) {
		var j, sprite;
		this.tick = 0;
		this.done = false;
		for (j = 0; sprite = this.sprites[j]; j++) {
			sprite.setXOffset(this.triplets[0][0]);
			sprite.setYOffset(this.triplets[0][1]);
			if (update)
				sprite.update();
		}
		return this;
	};

	Cycle.prototype.go = function gotoCycle(n) {
		var j, sprite;
		for (j = 0; sprite = this.sprites[j]; j++) {
			sprite.setXOffset(this.triplets[n][0]);
			sprite.setYOffset(this.triplets[n][1]);
		}
		return this;
	};

	Ticker_ = function Ticker_(scene, paint, options) {

		// backward compatiblity from the 1.1.1 API
		if (typeof paint == "number") {
			var buf = paint;
			paint = options;
			options = { tickDuration: buf }
		}

		this.scene = scene;

		if (this.constructor !== Ticker_) {
			return new Ticker_(tickDuration, paint);
		}

		this.tickDuration = optionValue(options, 'tickDuration', 16);
		this.expectedFps = 1000 / this.tickDuration;
		this.useAnimationFrame = optionValue(options, 'useAnimationFrame', false);
		if (!sjs.requestAnimationFrame || !sjs.cancelAnimationFrame) {
			this.useAnimationFrame = false;
		}

		this.paint = paint;

		var that = this;
		this.bindedRun = function bindedRun(t) { that.run(t); }

		this.start = new Date().getTime();
		this.now = this.start;
		this.ticksElapsed = 0;
		// absolute number of ticks that have been played ever
		this.currentTick = 0;
		this.ticksSinceLastStart = 0;
		this.droppedFrames = 0;
		// will divide the framerate by 2 if true
		this.lowFrameRate = false;
	};

	Ticker_.prototype.next = function (timestamp) {
		var now = new Date().getTime();
		this.diff = now - this.now;
		this.now = now;
		// number of ticks that have elapsed since the last start
		this.lastTicksElapsed = Math.round(this.diff / this.tickDuration);
		this.droppedFrames += Math.max(0, this.lastTicksElapsed - 1);
		this.ticksSinceLastStart += this.lastTicksElapsed;
		// add the diff to the current ticks
		this.currentTick += this.lastTicksElapsed;
		return this.lastTicksElapsed;
	};

	Ticker_.prototype.run = function (timestamp) {
		if (this.paused) {
			return;
		}
		/*if(this.lowFrameRate || this.load > 20 && this.fps < (this.expectedFps / 2)) {
			this.lowFrameRate = true;
			if(this.skippedFrames == 1) {
				this.skippedFrames = 0;
				this.skipPaint = true;
				this.scene.disableUpdate = true;
			} else {
				this.skippedFrames = 1;
				this.skipPaint = false;
				this.scene.disableUpdate = false;
			}
		} else {
			this.skipPaint = false;
		}*/

		var t = this;
		var ticksElapsed = this.next(timestamp);

		// no update needed, this happen on the first run
		/*if (ticksElapsed == 0) {
			// this is not a cheap operation
			setTimeout(this.bindedRun, this.tickDuration);
			return;
		}*/

		//if(!this.skipPaint) {
		for (var name in this.scene.layers) {
			var layer = this.scene.layers[name];
		}
		//}

		this.paint(this);
		// reset the keyboard change
		if (this.scene.input) {
			this.scene.input.next();
		}
		this.timeToPaint = (new Date().getTime()) - this.now;
		// spread the load value on 2 frames so the value is more stable
		this.load = ((this.timeToPaint / this.tickDuration * 100) + this.load) >> 1;
		this.fps = Math.round(1000 / (this.now - (this.lastPaintAt || 0)));

		this.lastPaintAt = this.now;
		if (this.useAnimationFrame) {
			this.tickDuration = 16;
			this.animationId = global[sjs.requestAnimationFrame](this.bindedRun);
		} else {
			var _nextPaint = Math.max(this.tickDuration - this.timeToPaint, 6);
			this.timeout = setTimeout(this.bindedRun, _nextPaint);
		}
	};

	Ticker_.prototype.pause = function () {
		if (this.useAnimationFrame) {
			global[sjs.cancelAnimationFrame](this.animationId);
		} else {
			global.clearTimeout(this.timeout);
		}
		this.paused = true;
	};

	Ticker_.prototype.resume = function () {
		this.start = new Date().getTime();
		this.ticksElapsed = 0;
		this.ticksSinceLastStart = 0;
		this.paused = false;
		this.run();
	};


	var inputSingleton = false;
	function Input(scene) {
		if (!inputSingleton)
			inputSingleton = new _Input(scene);
		return inputSingleton;
	};

	_Input = function _Input(scene) {

		if (scene)
			this.dom = scene.dom;
		else
			this.dom = doc.body;

		var that = this;

		// record the current keyboard state
		this.keyboard = {};
		this.mouse = { position: {}, click: undefined };
		// record the keyboard changes since the last call
		this.keyboardChange = {};
		this.mousedown = false;
		that.mousepressed = false;
		this.mousereleased = false;
		this.keydown = false;
		this.touchMoveSensibility = 20;
		this.enableCustomEvents = false;

		this.touchable = 'ontouchstart' in global;

		this.next = function () {
			if (this.disableFor)
				this.disableFor = that.disableFor - 1;
			this.keyboardChange = {};
			this.mousepressed = false;
			this.mouse.click = undefined;
			this.mousereleased = false;
		}

		this.disableFor = 0;
		this.disable = function (ticks) {
			that.disableFor = ticks;
		}

		this.keyPressed = function (name) {
			return that.keyboardChange[name] !== undefined && that.keyboardChange[name];
		};

		this.keyReleased = function (name) {
			return that.keyboardChange[name] !== undefined && !that.keyboardChange[name];
		};

		this.arrows = function arrows() {
			/* Return true if any arrow key is pressed */
			return this.keyboard.right || this.keyboard.left || this.keyboard.up || this.keyboard.down;
		};

		function fireEvent(name, value) {
			if (!that.enableCustomEvents)
				return;
			if (doc.createEvent) {
				var evObj = doc.createEvent('Events');
				evObj.initEvent('sjs' + name, true, true);
				evObj.value = value;
				that.dom.dispatchEvent(evObj);
			} else if (doc.createEventObject) {
				var evObj = doc.createEventObject();
				evObj.value = value;
				that.dom.fireEvent('onsjs' + name, evObj);
			}
		}

		function updateKeyChange(name, val) {
			fireEvent(name, val);
			if (name == "space" || name == "enter") {
				updateKeyChange("action", val)
			}
			if (that.keyboard[name] !== val) {
				that.keyboard[name] = val;
				that.keyboardChange[name] = val;
			}
		}

		// this is handling WASD, and arrows keys
		function updateKeyboard(e, val) {
			if (e.keyCode == 40 || e.keyCode == 83) {
				updateKeyChange('down', val);
			}
			if (e.keyCode == 38 || e.keyCode == 87) {
				updateKeyChange('up', val);
			}
			if (e.keyCode == 39 || e.keyCode == 68) {
				updateKeyChange('right', val);
			}
			if (e.keyCode == 37 || e.keyCode == 65) {
				updateKeyChange('left', val);
			}
			if (e.keyCode == 32) {
				updateKeyChange('space', val);
			}
			if (e.keyCode == 17) {
				updateKeyChange('ctrl', val);
			}
			if (e.keyCode == 13) {
				updateKeyChange('enter', val);
			}
			if (e.keyCode == 27) {
				updateKeyChange('esc', val);
			}
			// 0..9, a-z
			if (e.keyCode >= 48 && e.keyCode <= 90) {
				var keyStr = String.fromCharCode(e.keyCode);
				updateKeyChange(keyStr.toLowerCase(), val);
			}
		}

		var listen = function (name, fct) {
			_addEventListener(global, name, fct, false);
		}

		// Mouse like events
		function clickEvent(event) {
			that.mouse.click = {
				x: (event.clientX - that.dom.offsetLeft) / scene.xscale,
				y: (event.clientY - that.dom.offsetTop) / scene.yscale
			};
		}

		function mouseDownEvent(event) {
			that.mousedown = true;
			that.mouse.down = true;
			that.mousepressed = true;
			// prevent unwanted browser drag and drop behavior
			_preventEvent(event);
		}

		function mouseUpEvent(event) {
			that.mousedown = false;
			that.mouse.down = false;
			that.mousereleased = true;
			that.mouse.click = {
				x: (event.clientX - that.dom.offsetLeft) / scene.xscale,
				y: (event.clientY - that.dom.offsetTop) / scene.yscale
			};
		}

		function mouseMoveEvent(event) {
			that.mouse.position = {
				x: (event.clientX - that.dom.offsetLeft) / scene.xscale,
				y: (event.clientY - that.dom.offsetTop) / scene.yscale
			};
		}

		function reduceTapEvent(e) {
			// To simplify I ignore multiple touch events and only return the first event
			if (e.touches && e.touches.length) { e = e.touches[0]; }
			else if (e.changedTouches && e.changedTouches.length) { e = e.changedTouches[0]; }
			return e
		}

		if (this.touchable) {
			listen("touchstart", function (e) {
				e = reduceTapEvent(e);
				updateKeyChange('space', true); // tap imitates space
				// simulate the click
				clickEvent(e);
				//store initial coordinates to find out swipe directions later
				that.touchStart = { "x": e.clientX, "y": e.clientY };

			});

			listen("touchend", function (e) {
				mouseUpEvent(e);
				that.keyboard = {}
				that.touchStart = null;
			});

			listen("touchmove", function (e) {
				_preventEvent(e); // avoid scrolling the page
				e = reduceTapEvent(e);
				updateKeyChange('space', false); // if it moves: it is not a tap
				mouseMoveEvent(e);
				if (that.touchStart) {
					var deltaX = e.clientX - that.touchStart.x;
					var deltaY = e.clientY - that.touchStart.y;

					if (deltaY < -that.touchMoveSensibility) {
						updateKeyChange('up', true);
						updateKeyChange('down', false);
					} else if (deltaY > that.touchMoveSensibility) {
						updateKeyChange('down', true);
						updateKeyChange('up', false);
					} else {
						updateKeyChange('up', false);
						updateKeyChange('down', false);
					}
					if (deltaX < -that.touchMoveSensibility) {
						updateKeyChange('left', true);
						updateKeyChange('right', false);
					} else if (deltaX > that.touchMoveSensibility) {
						updateKeyChange('right', true);
						updateKeyChange('left', false);
					} else {
						updateKeyChange('left', false);
						updateKeyChange('right', false);
					}
				}
			});

			listen("touchmove", function (e) {
				e = reduceTapEvent(e);
				mouseMoveEvent(e);
			});
		};

		listen("mousedown", mouseDownEvent);
		listen("mouseup", mouseUpEvent);
		listen("click", clickEvent);
		listen("mousemove", mouseMoveEvent);

		listen("keydown", function (e) {
			that.keydown = true;
			updateKeyboard(e, true);
		});

		listen("keyup", function (e) {
			that.keydown = false;
			updateKeyboard(e, false);
		});

		// can be used to avoid key jamming
		listen("keypress", function (e) { });
		if (!sjs.debug)
			listen("contextmenu", function (e) { _preventEvent(e); });
	};


	// Add an automatic pause to all the scenes when the user
	// quit the current window.
	_addEventListener(global, "blur", function (e) {
		for (var i = 0; i < sjs.scenes.length; i++) {
			var scene = sjs.scenes[i];
			if (!scene.autoPause)
				continue;
			var anon = function (scene) {
				Input(scene);
				inputSingleton.keyboard = {};
				inputSingleton.keydown = false;
				inputSingleton.mousedown = false;
				// create a semi transparent layer on the game
				if (scene.ticker && !scene.ticker.paused) {
					scene.ticker.pause();
					var div = overlay(0, 0, scene.w, scene.h);
					div.innerHTML = '<h1>Paused</h1><p>Click or press any key to resume.</p>';
					div.style.textAlign = 'center';
					div.style.paddingTop = ((scene.h / 2) - 32) + 'px';
					var listener = function (e) {
						_preventEvent(e);
						scene.dom.removeChild(div);
						_removeEventListener(doc, 'click', listener, false);
						_removeEventListener(doc, 'keyup', listener, false);
						scene.ticker.resume();
					}
					_addEventListener(doc, 'click', listener, false);
					_addEventListener(doc, 'keyup', listener, false);
					scene.dom.appendChild(div);
				}
			}
			anon(scene);
		}
	}, false);

	Layer = function Layer(scene, name, options) {

		var domElement, needToCreate, domH, domW;

		if (!this || this.constructor !== Layer)
			return new Layer(scene, name, options);

		this.sprites = {};
		this.scene = scene;

		if (options === undefined)
			options = { useCanvas: false, autoClear: true }

		if (options.autoClear === undefined)
			this.autoClear = true;
		else
			this.autoClear = options.autoClear;

		this.useCanvas = false;

		this.name = name;
		if (this.scene.layers[name] === undefined) {
			this.scene.layers[name] = this;
		} 
		else {
			if (sjs.debug) {
				sjs.warning("A layer named " + name + " already exist.");
			}
			// if the user try to create a Layer that already exists,
			// we send back the same.
			return this.scene.layers[name];
		}

		this.lastZIndex = 0;

		domElement = doc.getElementById(name);
		needToCreate = !domElement;

		if (needToCreate) {
			domElement = doc.createElement('div');
		}


		if (!needToCreate) {
			domH = domElement.height || domElement.style.height;
			domW = domElement.width || domElement.style.width;
		}
		else {
			domH = false;
			domW = false;
		}

		if (options.parent) {
			this.parent = options.parent;
		}
		else {
			this.parent = this.scene.dom;
		}
		this.parent.appendChild(domElement);
		domElement.id = domElement.id || 'sjs' + scene.id + '-' + name;
		if (!options.disableAutoZIndex) {
			zindex += 1;
			domElement.style.zIndex = String(zindex);
		}
		domElement.style.backgroundColor = options.color || domElement.style.backgroundColor;
		this.h = options.h || domH || scene.h;
		this.w = options.w || domW || scene.w;

		var style = domElement.style;
		style.height = this.h + 'px';
		style.width = this.w + 'px';
		style.position = 'absolute';
		style.top = domElement.style.top || '0px';
		style.left = domElement.style.left || '0px';
		style["TransformOrigin"] = "center center"; //this.xTransformOrigin + " " + this.yTransformOrigin;


		this.dom = domElement;

	};

	Layer.prototype.constructor = Layer;

	Layer.prototype.clear = function clear() {
	};

	Layer.prototype.Sprite = function (options) {
		if (options) {
			options.layer = this;
		}
		else {
			options = { layer: this };
		}
		return new Sprite(this, options);
	};

	Layer.prototype.remove = function remove() {
		this.parent.removeChild(this.dom);
		delete this.scene.layers[this.name];
	};

	Layer.prototype.addSprite = function addSprite(sprite) {
		var index = Math.random() * 11;
		this.sprites[index] = sprite;
		return index
	};

	Layer.prototype.setColor = function setColor(color) {
		this.dom.style.backgroundColor = color;
	};

	Layer.prototype.onTop = function onTop(color) {
		zindex += 1;
		this.dom.style.zIndex = String(zindex);
	};

	List = function List(list) {
		if (this.constructor !== List)
			return new List(list);
		// ensure that a List can be initialized with a list.
		this.list = (list && (list.list || list)) || [];
		this.length = this.list.length;
		this.index = -1;
	};

	List.prototype.add = function add(sprite) {
		if (sprite.length)
			this.list.push.apply(this.list, sprite);
		else
			this.list.push(sprite);
		this.length = this.list.length;
	};

	// alias
	List.prototype.append = List.prototype.add;

	List.prototype.remove = function remove(toRemove) {
		var removed = false
		for (var i = 0, el; el = this.list[i]; i++) {
			if (el == toRemove) {
				this.list.splice(i, 1);
				// delete during the iteration is possible
				if (this.index > -1)
					this.index = this.index - 1;
				i--;
				removed = true;
			}
		}
		this.length = this.list.length;
		return removed;
	};

	List.prototype.iterate = function iterate() {
		this.index += 1;
		if (this.index >= this.list.length) {
			this.index = -1;
			return false;
		}
		return this.list[this.index];
	};

	List.prototype.pop = function pop() {
		this.length -= 1;
		return this.list.pop();
	};

	List.prototype.shift = function shift() {
		this.index -= 1;
		this.length -= 1;
		return this.list.shift();
	};

	List.prototype.isIn = function isInList(el) {
		for (var i = 0; i < this.list.length; i++) {
			if (this.list[i] == el) {
				return true;
			}
		}
		return false;
	}

	List.prototype.filter = function filterList(name, value) {
		var newList = new List();
		for (var i = 0; i < this.list.length; i++) {
			if (this.list[i][name] == value) {
				newList.add(this.list[i]);
			}
		}
		return newList;
	}

	List.prototype.empty = function () {
		this.list = [];
		this.length = 0;
		this.index = -1;
	}

	var log_output = null;

	function output(value) {
		if (!log_output) {
			log_output = doc.createElement('textarea');
			log_output.style.height = "200px";
			log_output.style.width = (window.innerWidth - 100) + 'px';
			doc.body.appendChild(log_output);
		}
		log_output.value = log_output.value + value;
		log_output.scrollTop = log_output.scrollHeight;
	}

	function _log() {
		if (!sjs.debug)
			return;
		var result = "";
		for (var i = 0; i < arguments.length; i++) {
			result += arguments[i] + ' ';
		}
		output(result + "\r\n");
	}

	var sjs = {
		// a global cache to load each sprite only one time.
		spriteCache: {},
		debug: false,
		Cycle: Cycle,
		Input: Input,
		Scene: Scene,
		// SpriteList: List, // backward compatibility 1.1.1
		List: List,
		Sprite: Sprite,
		overlay: overlay,
		scenes: [],
		error: function error(msg) { _log("Error: " + msg); },
		warning: function warning(msg) { _log("Warning: " + msg); },
		log: _log,
		createEvent: null,
		math: { hypo: hypo, mod: mod, normalVector: normalVector, lineSide: lineSide }
	};

	global.sjs = sjs;

})(window || this);

