export default () => {
	Number.prototype.matchAll = function(...masks) {
		return masks.every(mask => this.matchMask(mask));
	};
	Number.prototype.matchAny = function(...masks) {
		return masks.some(mask => this.matchMask(mask));
	};

	Number.prototype.matchMask = function(mask) {
		return (mask & this) > 0;
	};

	Number.prototype.except = function(...masks) {
		return masks.reduce((num, mask) => num ^ mask, this);
	};

	/**
	 * Converts number to a non-axponential script
	 * @author Sanford Staab
	 * @see https://stackoverflow.com/a/48872129/3491576
	 * @return {string}
	 */
	Number.prototype.toFullString = function() {
		let num = this;
		let numStr = String(num);

		if(Math.abs(num) < 1.0) {
			let e = parseInt(num.toString().split('e-')[1]);

			if(e) {
				let negative = num < 0;

				if(negative) {
					num *= -1;
				}

				num *= Math.pow(10, e - 1);
				numStr = '0.' + (new Array(e)).join('0') + num.toString().substring(2);

				if(negative) {
					numStr = "-" + numStr;
				}
			}
		} else {
			let e = parseInt(num.toString().split('+')[1]);

			if(e > 20) {
				e -= 20;
				num /= Math.pow(10, e);
				numStr = num.toString() + (new Array(e + 1)).join('0');
			}
		}

		return numStr;
	};

	Number.prototype.toStringWithPrecision = function(maxDecimals = 2, minDecimals = 0) {
		return this.format('auto', {
			groupSerarator: '',
			decimalPoint: '.',
			minAutoDecimals: minDecimals,
			maxAutoDecimals: maxDecimals,
		})
	};

	Number.prototype.format = function(decimals = 'auto', config = {}) {
		config = {
			groupSerarator: NBSP,
			decimalPoint: '.',
			minusSign: '-',
			minAutoDecimals: 2,
			maxAutoDecimals: 2,

			...config,
		};

		let value = this;

		const stringValue = value.toFullString();
		const decimalsCount = stringValue.indexOf('.') >= 0 ? stringValue.split('.').last.length : 0;

		if(decimals == 'auto') {
			decimals = decimalsCount ? Math.clamp(decimalsCount, config.minAutoDecimals, config.maxAutoDecimals) : 0;
		}

		if(decimals != decimalsCount) {
			value = Math.roundTo(this, decimals || 0);
		}

		const sign = value < 0 ? config.minusSign : '';

		let [int, dec] = value.toFullString().split('.');

		int = int || '0';
		dec = dec || '';

		int = (int.reverse().match(/.{1,3}/g) || ['0']).join('!').reverse().replace(/!/g, config.groupSerarator);
		dec = dec.slice(0, decimals);

		return `${sign}${int}${dec ? `${config.decimalPoint}${dec}` : ``}`;
	};

	Number.finite = function(number, defaultValue = null) {
		return isFinite(number) ? number : defaultValue;
	};
}