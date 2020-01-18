import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	import() {
		Object.without = function(obj, keysToRemove) {
			if(keysToRemove instanceof Array === false) {
				keysToRemove = [keysToRemove];
			}

			obj = {...obj};

			for(const key of keysToRemove) {
				delete obj[key];
			}

			return obj;
		};

		global.ObjectEqualTime = 0;
		Object.equal = function(a, b, depth = 64, debug = false, seenObjects = []) {
			let startTime;

			if(depth == 64) {
				startTime = Date.now();
			}

			try {
				const aType = valueType(a);
				const bType = valueType(b);

				if(aType != bType) {
					// Primitive type is different

					if(debug && a !== b) {
						console.log(debug, `[Object.equal] Found different primitive value`, [[a, b]]);
					}

					return false;
				}

				if(aType != Object && aType != Array) {
					// Use direct comparison
					if(aType == Date) {
						if(debug && a.getTime() === b.getTime()) {
							console.log(debug, `[Object.equal] Found different date`, [[a, b]]);
						}

						return a.getTime() === b.getTime();
					}

					if(debug && a !== b) {
						console.log(debug, `[Object.equal] Found different non-object value`, [[a, b]]);
					}

					return a === b;
				}

				if(seenObjects.has(a) || seenObjects.has(b)) {
					// Cyclic link
					if(debug && a !== b) {
						console.log(debug, `[Object.equal] Found different cyclic link`, [[a, b]]);
					}
					return a === b;
				}

				seenObjects.push(a, b);

				if(a.constructor != b.constructor) {
					// Constructor differs
					if(debug) {
						console.log(debug, `[Object.equal] Found different constructors in`, [[a, b]]);
					}

					return false;
				}

				const aKeys = Object.keys(a);
				const bKeys = Object.keys(b);

				if(aKeys.length != bKeys.length) {
					// Keys are different
					if(debug) {
						console.log(debug, `[Object.equal] Found different key length in`, [[a, b]]);
					}

					return false;
				}

				// noinspection JSUnresolvedVariable,JSUnresolvedFunction
				let isReact = global.React && React.isValidElement(a) && React.isValidElement(b);

				for(const key of aKeys) {
					if(key in b == false) {
						// Keys are different
						if(debug) {
							console.log(debug, `[Object.equal] Found missing key ${key} in`, [[a, b]]);
						}

						return false;
					}

					if(isReact && key == '_owner') {
						continue;
					}

					let aKeyIsObject = a[key] && a[key] instanceof Object && a[key].constructor === Object;
					let bKeyIsObject = b[key] && b[key] instanceof Object && b[key].constructor === Object;

					aKeyIsObject = aKeyIsObject || a[key] instanceof Array;
					bKeyIsObject = bKeyIsObject || b[key] instanceof Array;

					if(depth > 0 && aKeyIsObject && bKeyIsObject) {
						// Use recursive comparison.
						if(Object.equal(a[key], b[key], depth - 1, debug, seenObjects) == false) {
							if(debug) {
								console.log(debug, `[Object.equal]  | in key ${key}`);
							}

							return false;
						}
					} else if(a[key] !== b[key]) {
						// Depth is exceeded or this is not an object.
						if(debug) {
							if(depth <= 0) {
								console.log(debug, `[Object.equal] Depth exceeded at ${key}`, [[a, b]]);
							} else {
								console.log(debug, `[Object.equal] Direct comparison failed at ${key}`, [[a, b]]);
							}
						}

						return false;
					}
				}

				return true;
			} finally {
				if(depth == 64) {
					global.ObjectEqualTime += Date.now() - startTime;
				}
			}
		};

		Object.combine = function(k = [], v = []) {
			const result = {};

			for(const i of keys(k)) {
				result[k[i]] = v[i];
			}

			return result;
		};

		Object.pairs = function(obj) {
			return Object.keys(obj).map(key => ({ key, value: obj[key] }));
		};

		Object.cloneDeep = function(obj) {
			let clone = {};

			for(let i in obj) {
				// noinspection JSUnfilteredForInLoop
				if(obj[i] != null && typeof(obj[i]) == "object") {
					// noinspection JSUnfilteredForInLoop
					clone[i] = Object.cloneDeep(obj[i]);
				} else { // noinspection JSUnfilteredForInLoop
					clone[i] = obj[i];
				}
			}

			return clone;
		};

		Object.asyncConcurrent = async function asyncConcurrent(object) {
			if(valueType(object) != Object) {
				return object;
			}

			object = {...object};

			await keys(object).forEachAsyncConcurrent(async(key) => {
				if(isPromise(object[key]) == false) {
					return;
				}

				object[key] = await object[key];
			});

			return object;
		};

		Object.withoutEmptyNodes = function withoutEmptyNodes(object, maxDepth = 32) {
			const result = {};

			for(const key of keys(object)) {
				let value = object[key];

				if(valueType(value, true) == Object && maxDepth > 0) {
					value = Object.withoutEmptyNodes(value, maxDepth - 1);
				}

				if(!empty(value)) {
					result[key] = value;
				}
			}

			return result;
		};
	}
}