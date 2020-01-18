import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	import() {
		global.Random = class Random {
			/**
			 * Random value from 0 to 1
			 * @return {number}
			 */
			static get value() {
				return Math.random();
			}

			/**
			 * Random integer value from 0 to MAX_SAFE_INTEGER
			 * @return {number}
			 */
			static get integer() {
				return Random.RangeInt(0, Number.MAX_SAFE_INTEGER);
			}

			/**
			 * Random string with length of 8
			 * @return {number}
			 */
			static get key() {
				return Random.String();
			}

			static get char() {
				return Random.String(1);
			}

			/**
			 * Capacity: ~10MB/sec
			 * @param len
			 * @return {*}
			 */
			static String(len = 8) {
				if(len <= 0) {
					return '';
				}

				let buffer = "";

				while(len > 10) {
					buffer += Random.String(10);
					len -= 10;
				}

				return buffer + Random.RangeInt(36 ** (len - 1), 36 ** len).toString(36);
			}

			/**
			 * Returns random float between min and max
			 * @param min Minimal value, inclusive
			 * @param max Maximal value, inclusive
			 */
			static Range(min, max) {
				if(isUndefined(max)) {
					max = min;
					min = 0;
				}

				return min + Random.value * (max - min);
			}

			/**
			 * Returns random integer between min (inclusive) and max (non-inclusive)
			 * @param min Minimal value, inclusive
			 * @param max Maximal value, non-inclusive
			 */
			static RangeInt(min, max) {
				return Math.floor(Random.Range(min, max));
			}
		};
	}
}