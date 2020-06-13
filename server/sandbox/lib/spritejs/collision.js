/*
Sprite.js v1.2.0 collision extension
Copyright (c) 2011 Batiste Bieler and contributors, https://github.com/batiste/sprite.js
*/

(function (global) {

	var Sprite = sjs.Sprite;

	function inPolygon(polygonA, polygonB, debug) {

		var h, i, j,
			collision = false;

		// test to see if just a point coordinate (x,y) was sent in
		if (polygonA.hasOwnProperty('x')) {
			// convert to single-length array for traversal
			polygonA = [polygonA];
		}

		for (h = 0; h < polygonA.length; h += 1) {
			if (collision === false) {
				for (i = 0, j = polygonB.length - 1; i < polygonB.length; j = i++) {
					if (((polygonB[i].y > polygonA[h].y) !== (polygonB[j].y > polygonA[h].y))
						&& (polygonA[h].x < (polygonB[j].x - polygonB[i].x) * (polygonA[h].y - polygonB[i].y) / (polygonB[j].y - polygonB[i].y) + polygonB[i].x)
					) {
						collision = !collision;
					}
				}
			}
		}

		return collision;
	}


	// TODO: most expensive function, make it faster
	function rectangleEdges(sprite) {
		var bounds = sprite.getBoundsRect();
		// Return the 4 edges coordinate of the rectangle according the the rotation
		// at the center of the rectangle.
		var distance = sjs.math.hypo(bounds.w / 2, bounds.h / 2);
		var angle = Math.atan2(bounds.h, bounds.w);
		// 4 angles to reach the edges, starting up left (down left in the sprite.js coordinate)
		// and turning counter-clockwise
		var angles = [Math.PI - angle, angle, -angle, Math.PI + angle];
		var points = [];
		for (var i = 0; i < 4; i++) {
			points.push([
				distance * Math.cos(sprite.angle + angles[i]) + bounds.x + bounds.w / 2,
				distance * Math.sin(sprite.angle + angles[i]) + bounds.y + bounds.h / 2
			]);
		}
		return points;
	};


	function shapeCollides(a, b) {
		var aBox = a.getBoundsRect(),
			bBox = b.getBoundsRect();
		// quick shortcut
		if (Math.abs(aBox.x - bBox.x) > aBox.w + bBox.w) {
			return false;
		}

		if (Math.abs(aBox.y - bBox.y) > aBox.h + bBox.h) {
			return false;
		}

		return rectangleCollides(a, b);
	}

	function rectangleCollides(a, b) {

		// shortcut for unrotated rectangles.
		var x_inter,
			y_inter,
			aBox = a.getBoundsRect(),
			bBox = b.getBoundsRect();
		if (a.angle == 0 && b.angle == 0) {
			if (aBox.x > bBox.x) {
				x_inter = aBox.x - bBox.x < bBox.w;
			}
			else {
				x_inter = bBox.x - aBox.x < aBox.w;
			}
			if (x_inter == false)
				return false;

			if (aBox.y > bBox.y) {
				y_inter = aBox.y - bBox.y < bBox.h;
			} else {
				y_inter = bBox.y - aBox.y < aBox.h;
			}
			return y_inter;
		};

		// cache the expensive edges function
		a.edges = rectangleEdges(a);
		b.edges = rectangleEdges(b);

		for (var i = 0; i < 4; i++) {
			if (isPointInRectangle(b.edges[i][0], b.edges[i][1], a)) {
				return true;
			}
		}
		for (var i = 0; i < 4; i++) {
			if (isPointInRectangle(a.edges[i][0], a.edges[i][1], b)) {
				return true;
			}
		}
		return false;
	}

	function isPointInRectangle(x, y, sprite) {
		var bounds = sprite.getBoundsRect();
		// Return true if the point is within the rectangle surface.
		// the edges need to the be precalcualted
		if (!sprite.angle)
			return (x >= bounds.x && x < bounds.x + bounds.w
				&& y >= bounds.y && y < bounds.y + bounds.h);

		for (var i = 0; i < 4; i++) {
			var j = i + 1;
			if (j > 3)
				j = 0;
			// if on the right of the line, the point
			// cannot be in the rectangle
			if (sjs.math.lineSide(
				sprite.edges[i][0], sprite.edges[i][1],
				sprite.edges[j][0], sprite.edges[j][1],
				x, y
			)) {
				return false
			}
		}
		return true;
	};

	var image_data_cache = {};

	Sprite.prototype.isPointIn = function isPointIn(x, y) {
		this.edges = rectangleEdges(this);
		return isPointInRectangle(x, y, this);
	}

	Sprite.prototype.collidesWith = function collidesWith(sprite) {
		if (this.id == sprite.id)
			return true;
		return shapeCollides(this, sprite);
	};

	Sprite.prototype.edges = function edges() {
		return rectangleEdges(this);
	};

	Sprite.prototype.collidesWith = function collidesWith(sprite) {
		if (this.id == sprite.id)
			return true;
		return shapeCollides(this, sprite);
	};

	Sprite.prototype.collidesWithArray = function collidesWithArray(sprites) {
		// Return a sprite if the current sprite has any collision with the Array provided
		// a sprite cannot collides with itself.

		// Make the List works
		if (sprites.list)
			sprites = sprites.list;

		for (var i = 0, sprite; sprite = sprites[i]; i++) {
			if (this != sprite && this.collidesWith(sprite)) {
				return sprite;
			}
		}
		return false;
	};

	function resolveCollisions() {
		// return each pair of collision
		var collisions = {};
		// the function accept any amount of array of elements
		if (arguments.length == 1)
			var elements = arguments[0];
		else
			var elements = Array.prototype.concat.apply([], arguments);
		// search collisions elements by elements
		// O(N/2 * N/2)
		for (var i = 0; i < elements.length; i++) {
			var el = elements[i];
			for (var j = i + 1; j < elements.length; j++) {
				if (el.collidesWith(elements[j])) {
					collisions[el] = elements[j];
					collisions[elements[j]] = el;
				}
			}
		}
		return collisions;
	}

	global.sjs.collision = {
		'find': resolveCollisions,
		'isPointInRectangle': isPointInRectangle
	};

})(this);
