import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	import() {
		global.Throttler = class Throttler {
			lastCall = 0;
			delay = 0;

			constructor(delay = 33) {
				this.delay = delay;
			}

			pass(fn) {
				if(Date.now() - this.lastCall > this.delay) {
					this.lastCall = Date.now();
					fn();

					return true;
				}

				return false;
			}
		};
	}
}