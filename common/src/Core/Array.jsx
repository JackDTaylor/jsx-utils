import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	import() {
		const arrayFn = function(name, value) {
			Object.defineProperty(Array.prototype, name, { enumerable: false, configurable: true, value });
		};

		const arrayGetter = function(name, get) {
			Object.defineProperty(Array.prototype, name, { enumerable: false, configurable: true, get });
		};

		/** @class Array
		 *  @property first */
		arrayGetter('first', function() {
			return this[0];
		});

		/** @class Array
		 *  @property last */
		arrayGetter('last', function() {
			return this[ this.length - 1 ];
		});

		/** @class Array
		 *  @property has */
		arrayFn('has', function(element) {
			return this.indexOf(element) >= 0;
		});

		/** @class Array
		 *  @property indexBy */
		arrayFn('indexBy', function(keyExpr) {
			if(valueType(keyExpr) != Function) {
				const key = keyExpr;
				keyExpr = x => x[key];
			}

			const result = {};
			for(const item of this) {
				const key = keyExpr(item);

				result[key] = result[key] || [];
				result[key].push(item);
			}

			return result;
		});

		/** @class Array
		 *  @property keymapBy */
		arrayFn('keymapBy', function(keyExpr) {
			if(valueType(keyExpr) != Function) {
				const key = keyExpr;
				keyExpr = x => x[key];
			}

			return Object.combine(this.map(keyExpr), this);
		});

		/** @class Array
		 *  @property move */
		arrayFn('move', function(previousIndex, newIndex) {
			let result = this.slice(0);

			if(newIndex >= result.length) {
				let k = newIndex - result.length + 1;

				while(k--) {
					result.push(undefined);
				}
			}

			result.splice(newIndex, 0, result.splice(previousIndex, 1)[0]);

			return result;
		});

		/** @class Array
		 *  @property subtract */
		arrayFn('subtract', function(otherArray) {
			return this.intersect(otherArray, false);
		});

		/** @class Array
		 *  @property union */
		arrayFn('union', function(otherArray) {
			if(otherArray instanceof Array == false) {
				otherArray = [];
			}

			return [...this, ...otherArray.subtract(this) ];
		});

		/** @class Array
		 *  @property intersect */
		arrayFn('intersect', function(otherArray, returnIntersected = true) {
			if(otherArray instanceof Array == false) {
				otherArray = [];
			}

			return this.filter(item => otherArray.has(item) == returnIntersected);
		});

		/** @class Array
		 *  @property mapAsyncConcurrent */
		arrayFn('mapAsyncConcurrent', async function(callback) {
			let results = [];

			await this.forEachAsyncConcurrent(async(e, i) => {
				results[i] = await callback.apply(this, [this[i], i, this]);
			});

			return results;
		});

		/** @class Array
		 *  @property forEachAsyncConcurrent */
		arrayFn('forEachAsyncConcurrent', async function(callback) {
			await global.Bluebird.all(this.map(callback));
		});

		/** @class Array
		 *  @property mapAsync */
		arrayFn('mapAsync', async function(callback, thisArg = this) {
			const result = [];

			for(let i = 0; i < this.length; i++) {
				result[i] = await callback.apply(thisArg, [this[i], i, this]);
			}

			return result;
		});

		/** @class Array
		 *  @property forEachAsync */
		arrayFn('forEachAsync', async function(callback) {
			await this.mapAsync(callback);
		});

		/** @class Array
		 *  @property mapReact */
		arrayFn('mapReact', function(fn) {
			return this.map((e, i) => <React.Fragment key={i}>{fn.apply(this, [e, i])}</React.Fragment>)
		});

		/** @class Array
		 *  @property unique */
		arrayFn('unique', function(getter) {
			if(getter) {
				// noinspection CommaExpressionJS
				return this.reduce((a,k) => (a.map(getter).has(getter(k)) || a.push(k), a), [])
			}

			// noinspection CommaExpressionJS
			return this.reduce((a,k) => (a.has(k) || a.push(k), a), []);
		});

		/** @class Array
		 *  @property exceptEmpty */
		arrayFn('exceptEmpty', function() {
			return this.filter(x => x);
		});

		/** @class Array
		 *  @property reorder */
		arrayFn('reorder', function(getter, newOrder = [], alwaysFirst = [], alwaysLast = []) {
			if(!Array.isArray(newOrder)) {
				return [...this];
			}

			return [...this].sort((a, b) => {
				a = getter(a);
				b = getter(b);

				if(alwaysFirst.has(a) || alwaysLast.has(b)) {
					return -1;
				}

				if(alwaysFirst.has(b) || alwaysLast.has(a)) {
					return 1;
				}

				if(newOrder.has(a) && newOrder.has(b)) {
					return newOrder.indexOf(a) - newOrder.indexOf(b);
				}

				if(newOrder.has(a) && newOrder.has(b) == false) {
					return -1;
				}

				if(newOrder.has(a) == false && newOrder.has(b)) {
					return 1;
				}

				return 0;
			});
		});

		/** @class Array
		 *  @property sortByProp */
		arrayFn('sortByProp', function(getter) {
			if(valueType(getter) == String) {
				const prop = getter;
				getter = x => x[prop];
			}

			let result = [...this];

			result.sort((a, b) => compare(getter(a), getter(b)));

			return result;
		});

		/** @class Array
		 *  @property sum */
		arrayGetter('sum', function() {
			return this.reduce((p,c) => p + parseFloat(c), 0);
		});

		/** @class Array
		 *  @property avg */
		arrayGetter('avg', function() {
			return this.length > 0 ? this.reduce((p,c) => p+c, 0) / this.length : 0;
		});

		/** @class Array
		 *  @property min */
		arrayGetter('min', function() {
			return this.length > 0 ? this.reduce((min, val) => val < min ? val : min, this[0]) : undefined;
		});

		/** @class Array
		 *  @property max */
		arrayGetter('max', function() {
			return this.length > 0 ? this.reduce((max, val) => val > max ? val : max, this[0]) : undefined;
		});

		Array.diff = function(prev, next, getItemKey = x => x, compareItems = (a, b) => Object.equal(a, b)) {
			prev = prev || [];
			next = next || [];

			const prevMap = prev.keymapBy(getItemKey);
			const nextMap = next.keymapBy(getItemKey);

			const prevKeys = prev.map(getItemKey);
			const nextKeys = next.map(getItemKey);

			const created = nextKeys.subtract(prevKeys).map(key => nextMap[key]);
			const removed = prevKeys.subtract(nextKeys).map(key => prevMap[key]);
			const updated = [];

			for(const item of next) {
				const key = getItemKey(item);

				if(prevKeys.has(key) == false) {
					// Item was created
					continue;
				}

				if(compareItems(prevMap[key], item)) {
					// Items are equal
					continue;
				}

				updated.push({
					prev: prevMap[key],
					next: item,
				});
			}

			return {created, removed, updated};
		};
	}
}