import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	import() {
		String.prototype.ucFirst = function() {
			return this.slice(0, 1).toUpperCase() + this.slice(1);
		};
		String.prototype.lcFirst = function() {
			return this.slice(0, 1).toLowerCase() + this.slice(1);
		};

		String.prototype.invertKeyboardLayout = function(sticky = false) {
			if(!global.KeyboardLayout) {
				throw new Error("Module `common.Utils.KeyboardLayout` is not imported");
			}

			return KeyboardLayout.Invert(this, sticky);
		};

		String.prototype.plural = function(num = 0, animateness = false) {
			if(!global.Plural) {
				throw new Error("Module `common.Utils.Plural` is not imported");
			}

			return Plural.format(num, this, animateness);
		};

		String.prototype.toEnglishPlural = function() {
			return (this + 's').replace(/ss$/, 'ses').replace(/([^aeiouy])ys$/, '$1ies');
		};

		String.prototype.reverse = function() {
			return this.split('').reverse().join('');
		};

		String.prototype.toInt = function() {
			return parseInt(this);
		};

		String.prototype.toFloat = function() {
			return parseFloat(this);
		};

		(original => (
			/** @param chars */
			String.prototype.trimLeft = function trimLeft(chars = null) {
				if(!chars) {
					return original.apply(this);
				}

				// noinspection JSRemoveUnnecessaryParentheses
				return this.replace(new RegExp(`^[${RegExp.quote(chars)}]+`, 'g'), '')
			}
		))(String.prototype.trimLeft);

		(original => (
			/** @param chars */
			String.prototype.trimRight = function trimRight(chars = null) {
				if(!chars) {
					return original.apply(this);
				}

				// noinspection JSRemoveUnnecessaryParentheses
				return this.replace(new RegExp(`[${RegExp.quote(chars)}]+$`, 'g'), '')
			}
		))(String.prototype.trimRight);

		String.prototype.trimStart = String.prototype.trimLeft;
		String.prototype.trimEnd = String.prototype.trimRight;

		// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd
		if (!String.prototype.padStart || !String.prototype.padEnd) {
			const strPad = function strPad(string, targetLength, padString = ' ', isStart = true) {
				targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
				padString = String(padString);

				if(string.length > targetLength) {
					return String(string);
				} else {
					targetLength = targetLength - string.length;

					if(targetLength > padString.length) {
						padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
					}

					if(isStart) {
						return padString.slice(0, targetLength) + String(string);
					} else {
						return String(string) + padString.slice(0, targetLength);
					}
				}
			};

			String.prototype.padStart = function padStart(targetLength, padString = ' ') {
				return strPad(this, targetLength, padString, true);
			};

			String.prototype.padEnd = function padEnd(targetLength, padString = ' ') {
				return strPad(this, targetLength, padString, false);
			};
		}

		/**
		 * Trims the string
		 * @param chars
		 * @return {*}
		 */
		String.prototype.trim = function trim(chars = null) {
			return this.trimLeft(chars).trimRight(chars);
		};

		String.prototype.has = function(substring) {
			return this.indexOf(substring) >= 0;
		};
	}
}