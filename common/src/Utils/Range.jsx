import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	import() {
		global.Range = class Range {
			from;
			to;

			static PrepareValue(value) {
				if(valueType(value) == String && /^-?\d+(\.\d+)?$/.test(value)) {
					return parseFloat(value);
				}

				return value;
			}

			constructor(from, to) {
				from = Range.PrepareValue(from);
				to   = Range.PrepareValue(to);

				if(to !== null && valueType(to) != String && valueType(from) != Date) {
					to = parseFloat(to);
				}

				if(from !== null && to != null && from > to) {
					[from, to] = [to, from];
				}

				this.from = from;
				this.to = to;
			}

			/**
			 * Apply range to Knex query
			 * @param key
			 * @param where
			 * @param builder
			 * @returns {*}
			 */
			applyToQuery(key, where, builder) {
				const endInclusive = this.from === null || this.from == this.to;

				if(this.from !== null) {
					builder = builder[where](key, '>=', this.from);
				}

				if(this.to !== null) {
					builder = builder[where](key, endInclusive ? '<=' : '<', this.to);
				}

				return builder;
			}

			clamp(min, max) {
				if(this.from < min) {
					this.from = min;
				}

				if(this.to > max) {
					this.to = max;
				}

				return this;
			}
		};

		global.range = function(from, to) {
			return new Range(from, to);
		};
	}
}