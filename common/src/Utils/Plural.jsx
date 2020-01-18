import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	*dependencies() {
		yield "common.Utils.Noun";
	}

	import() {
		global.Plural = class Plural {
			static word(n, name, animateness) {
				return NounPluralization.pluralize(name, parseFloat(n), animateness);
			}

			static format(n, name, animateness) {
				return n + NBSP + Plural.word(n, name, animateness);
			}
		};
	}
}