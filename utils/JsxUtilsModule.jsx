export default class JsxUtilsModule {
	key;
	utils;

	/** @returns {IterableIterator<*>} */
	*dependencies() {}

	get cfg() {
		return this.utils.config;
	}

	constructor(key, utils) {
		this.key = key;
		this.utils = utils;
	}

	isMatchingSelector(selector) {
		if(selector == "*") {
			return true;
		}

		if(selector.indexOf("*") < 0) {
			return this.key == selector;
		}

		const regex = new RegExp(`^${selector.replace(/\./g, '\.').replace(/\*/g, '.*')}$`);
		return regex.test(this.key);
	}

	dependency(expr) {
		return this.utils.require(expr, true);
	}

	import() {
		throw new Error("JsxUtilsModule cannot be imported by itself");
	}
}