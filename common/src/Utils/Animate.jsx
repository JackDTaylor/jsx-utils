import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	*dependencies() {
		yield "common.Async";
	}

	import() {
		global.Animate = class Animate {
			static async Worker(step, onComplete = fn=>{}) {
				let stop = false;
				const stopper = x => stop = true;
				let timePassed = 0;

				while(timePassed < global.MAX_ANIMATION_TIME || 120000) {
					await step(timePassed, stopper);
					await delay(Time.deltaTime);

					timePassed += Time.deltaTime;

					if(stop) {
						break;
					}
				}

				await onComplete(timePassed);
				// console.log('Animation complete in ', timePassed, 'ms');
			}

			static async SmoothDamp(handler, targetValue, time = 500, precision = 0.01, maxSpeed = Infinity) {
				const sd = {};

				let get, set, getTargetValue;

				if(valueType(handler) == Array) {
					const [[object,reference]] = handler;

					get = ()  => object[reference];
					set = val => object[reference] = val;
					getTargetValue = () => targetValue;
				} else {
					get = handler.get;
					set = handler.set;
					getTargetValue = handler.getTargetValue || (() => targetValue);
				}

				const worker = (t, stopAnimation) => {
					set(Math.smoothDamp(get(), getTargetValue(), sd, time, maxSpeed));

					if(Math.abs(get() - getTargetValue()) < precision) {
						stopAnimation();
					}
				};

				const onComplete = () => {
					set(getTargetValue());
				};

				return Animate.Worker(worker, onComplete);
			}
		};
	}
}