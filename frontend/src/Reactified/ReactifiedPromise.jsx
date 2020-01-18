import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	*dependencies() {
		yield "react";
		yield "common.Async";
		yield "frontend.Decorators";
	}

	import() {
		const DefaultErrorSign = ({error}) => <div className="error">{error.message}</div>;
		const DefaultLoading   = ()        => <div className="loading" />;

		global.Reactified = global.Reactified || {};

		const ErrorSign = global.Reactified.ErrorSign || DefaultErrorSign;
		const Loading   = global.Reactified.Loading || DefaultLoading;

		let idCounter = 1;
		let VOID = { $symbol:'VOID' };

		class PromiseReactRenderer extends React.PureComponent {
			@prop promise;
			@state result = VOID;
			@state error;

			isCancelled = false;

			constructor() {
				super(...arguments);

				this.id = idCounter++;
			}

			async componentDidMount() {
				try {
					let result = await this.promise;

					if(this.isCancelled == false) {
						this.result = result;
					}
				} catch(error) {
					this.error = error;
				}

				this.commitState();
			}

			componentWillUnmount() {
				this.isCancelled = true;
			}

			render() {
				if(this.error) {
					return <ErrorSign error={this.error} />;
				}

				if(this.result === VOID) {
					return <Loading />;
				}

				return empty(this.result) ? '' : this.result;
			}
		}

		const processedPrototypes = [];

		for(const PromisePrototype of [Promise.prototype, Bluebird.prototype]) {
			if(processedPrototypes.has(PromisePrototype)) {
				continue;
			}

			Object.defineProperty(PromisePrototype, '@@iterator', {
				enumerable: false,
				value: function*() {
					yield <___ key={this}>{this.toReact()}</___>;
				}
			});

			Object.defineProperty(PromisePrototype, 'toReact', {
				enumerable: false,
				value() {
					if(this.isFulfilled()) {
						return this.value();
					}
					// console.warn('Not fulfilled promise', this);
					return <PromiseReactRenderer promise={this} />;
				}
			});

			processedPrototypes.push(PromisePrototype);
		}
	}
}