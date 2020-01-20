export default () => {
	class Vector {
		static Dimensions = undefined;

		static get Zero() {
			return new this(...Array(this.Dimensions).fill(1));
		}

		static get One() {
			return new this(...Array(this.Dimensions).fill(1));
		}

		/** @type {Number[]} */
		values;

		get size() {
			return this.values.length;
		}

		constructor(...values) {
			this.values = values;
		}

		get sqrMagnitude() {
			return this.values.map(x => x**2).sum;
		}
		get magnitude() {
			return Math.sqrt(this.sqrMagnitude);
		}

		add(target) {
			if(valueType(target) == Number) {
				target = new this.constructor(target, target);
			}

			this.assertSameSize(target);
			return new this.constructor(...this.values.map((x, i) => x + target.values[i]));
		}

		subtract(target) {
			if(valueType(target) == Number) {
				target = new this.constructor(target, target);
			}

			this.assertSameSize(target);
			return new this.constructor(...this.values.map((x, i) => x - target.values[i]));
		}

		multiply(target) {
			if(valueType(target) == Number) {
				target = new this.constructor(target, target);
			}

			this.assertSameSize(target);
			return new this.constructor(...this.values.map((x, i) => x * target.values[i]));
		}

		divide(target) {
			if(valueType(target) == Number) {
				target = new this.constructor(target, target);
			}

			this.assertSameSize(target);
			return new this.constructor(...this.values.map((x, i) => x / target.values[i]));
		}

		clamp(from = 0, to = 0) {
			if(valueType(from) == Number) {
				from = new this.constructor(from, from);
			}

			if(valueType(to) == Number) {
				to = new this.constructor(to, to);
			}

			this.assertSameSize(from);
			this.assertSameSize(to);

			return new this.constructor(...this.values.map((x, i) => Math.clamp(x, from.values[i], to.values[i])));
		}

		round() {
			return new this.constructor(...this.values.map(x => Math.round(x)));
		}

		get clone() {
			return new this.constructor(...this.values);
		}

		get inverse() {
			return new this.constructor(...this.values.map(x => -x));
		}

		get normalized() {
			return this.divide(this.magnitude);
		}

		assertSameSize(target) {
			if(this.size == target.size) {
				return;
			}

			console.warn('Different vector sizes:', this.size, target.size, [this, target]);
			throw new Error('Vector calculation is only available only for vectors of same size');
		}
	}

	class Vector2 extends Vector {
		static Dimensions = 2;

		get x() { return this.values[0] }
		get y() { return this.values[1] }

		constructor(x, y) {
			super(x, y);
		}
	}

	class Vector3 extends Vector {
		static Dimensions = 3;

		get x() { return this.values[0] }
		get y() { return this.values[1] }
		get z() { return this.values[2] }

		constructor(x, y, z) {
			super(x, y, z);
		}
	}

	global.Geometry = class Geometry {
		static Vector2 = Vector2;
		static Vector3 = Vector3;
	};
}