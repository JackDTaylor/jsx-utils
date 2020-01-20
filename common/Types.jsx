export default () => {
	/**
	 * Returns value type
	 * @param value
	 * @param objectConstructors
	 * @return {*}
	 */
	global.valueType = function valueType(value, objectConstructors = false) {
		if(typeof(value) === 'string' || value instanceof String) {
			return String;
		}

		if(typeof(value) === 'number' || value instanceof Number) {
			return Number;
		}

		if(typeof(value) === 'boolean' || value instanceof Boolean) {
			return Boolean;
		}

		if(typeof(value) === 'object' && value instanceof Array) {
			return Array;
		}

		if(typeof(value) === 'function' && value instanceof Function) {
			return Function;
		}

		if(value instanceof Date) {
			return Date;
		}

		if(value && typeof(value) === 'object' && value instanceof Object) {
			if(objectConstructors && value.constructor && value instanceof value.constructor) {
				return value.constructor;
			}

			return Object;
		}

		if(value) {
			console.warn('Unknown value')
		}

		return null;
	};

	/**
	 * Returns whether object is direct instance of Object
	 * @param value
	 * @return {*|boolean}
	 */
	global.isPlainObject = function isPlainObject(value) {
		return value && value instanceof Object && value.constructor === Object;
	};

	global.isUndefined = function isUndefined(value) {
		return typeof(value) === 'undefined';
	};

	/**
	 * Returns wheither value is undefined or null
	 * @param value
	 * @return {boolean}
	 */
	global.undefinedOrNull = function undefinedOrNull(value) {
		return isUndefined(value) || value === null;
	};

	/**
	 * Returns whether value is not undefined or null
	 * @param value
	 * @return {boolean}
	 */
	global.notUndefinedOrNull = function notUndefinedOrNull(value) {
		return !undefinedOrNull(value);
	};

	/**
	 * @param value
	 * @return {*}
	 */
	global.empty = function empty(value) {
		const type = valueType(value);

		return undefinedOrNull(value)
			|| (type == Number && isNaN(value))
			|| (type == Array  && value.length < 1)
			|| (type == Object && value.constructor == Object && Object.keys(value).length < 1)
			|| (value === "") ;
	};

	/**
	 * @param a
	 * @param b
	 * @returns {number}
	 */
	global.cmp = function(a, b) {
		if(a == b) {
			return 0;
		}

		return a > b ? 1 : -1;
	};

	/**
	 * @param value
	 * @returns {boolean}
	 */
	global.isPromise = function(value) {
		return value instanceof global.Bluebird || value instanceof Promise;
	};
}