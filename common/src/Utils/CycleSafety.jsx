import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	import() {
		global.CycleSafety = class CycleSafety {
			counter;
			throwOnLimit;

			constructor(throwOnLimit = false, limit = 256) {
				this.throwOnLimit = throwOnLimit;
				this.counter = limit;
			}

			get ok() {
				this.counter--;

				if(this.counter < 0 && this.throwOnLimit) {
					throw new Error("CycleSafety limit reached");
				}

				return this.counter >= 0;
			}
		};
	}
}