import JsxUtilsModule from "../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	*dependencies() {
		yield "react";
		yield "common.Utils.CacheStorage";
		yield "common.Async";
		yield "common.Decorators";
	}

	import() {
		global.StateProperty = class StateProperty {
			constructor(config = {}) {
				Object.assign(this, config);
			}
		};

		global.state = function state(proto, field, descriptor) {
			const initializer = descriptor.initializer;

			let initialValue = initializer && initializer();
			let config = new StateProperty;

			if(initialValue instanceof StateProperty) {
				config = initialValue;
				initialValue = config.value;
			}

			console.log('Proto UID', field, ObjectUID(proto), proto);

			let originalCWU = proto.componentWillUnmount || (() => {});

			proto.componentWillUnmount = function() {
				this.state$componentIsUnmounting = true;

				return originalCWU.apply(this, arguments);
			};

			proto.state$initDeferred = function state$initDeferred() {
				if('state$deferred' in this == false) {
					// console.log(this.constructor.name + this.id + ':ClearDeferStateA');
					this.state$deferred = {};
					this.state$deferredPromise = null;
					this.state$componentIsUnmounting = false;
				}
			};

			proto.state$applyDeferred = function state$applyDeferred() {
				this.allowRender = true;

				if(!this.state$deferred || this.state$componentIsUnmounting) {
					return;
				}

				this.setState(this.state$deferred);

				this.state$deferred = {};
			};

			proto.commitState = function() {
				if(this.state$deferredPromise) {
					this.state$deferredPromise.cancel();
					this.state$deferredPromise = null;
				}

				this.state$applyDeferred();
			};

			return {
				get() {
					this.state$initDeferred();

					if(field in this.state$deferred) {
						return this.state$deferred[field];
					}

					if(!this.state || field in this.state == false) {
						if(!this.state) {
							console.warn(
								'Initializing empty state in @state decorator getter. ' +
								'This may lead to warnings like "You cannot assign to state not in constructor". ' +
								'Make sure your `this.state` object was initialized if you want to use state with this component'
							);

							this.state = {};
						}

						this.state[field] = initialValue;
					}

					return this.state[field];
				},

				set(value) {
					this.state$initDeferred();

					const context = {stop: false};

					if(config.set) {
						value = config.set.apply(this, [value, context]);
					}

					if(context.stop) {
						return;
					}

					// console.log(this.constructor.name + this.id + ':SetState', field);
					// this.setState({ [field]: value });

					this.stateHash = `${this.stateHash}`.md5();
					this.state$deferred[field] = value;

					if(this.state$deferredPromise) {
						this.state$deferredPromise.cancel();
						this.state$deferredPromise = null;
					}

					this.state$deferredPromise = delay().then(fn => this.state$applyDeferred());
				}
			};
		};

		global.prop = function prop(proto, field, descriptor) {
			return {
				get() {
					if(field in this.props == false || isUndefined(this.props[field])) {
						return descriptor.initializer && descriptor.initializer.call(this);
					}

					return this.props[field];
				}
			};
		};

		global.ref = function ref(proto, field) {
			proto.constructor.Refs = proto.constructor.Refs || [];
			proto.constructor.Refs.push(field);

			return {
				configurable: true,

				get() {
					return this.ref[field].current;
				}
			};
		};

		global.hook = function hook(proto, field, descriptor) {
			const defaultRenderer = DecoratorUtils.getInitialValue(proto, field, descriptor, () => '');

			const hasHooked    = `has${field.ucFirst()}`;
			const beforeHooked = `before${field.ucFirst()}`;
			const renderHooked = `render${field.ucFirst()}`;
			const afterHooked  = `after${field.ucFirst()}`;

			Object.defineProperty(proto, hasHooked, {
				enumerable: false,
				configurable: true,

				get() {
					return true;
				}
			});

			Object.defineProperty(proto, beforeHooked, {
				enumerable: false,
				configurable: true,

				value() {
					return undefined;
				}
			});

			Object.defineProperty(proto, renderHooked, {
				enumerable: false,
				configurable: true,

				value() {
					return defaultRenderer.apply(this);
				}
			});

			Object.defineProperty(proto, afterHooked, {
				enumerable: false,
				configurable: true,

				value() {
					return undefined;
				}
			});

			return {
				enumerable: false,
				configurable: true,

				get() {
					if(this[hasHooked] == false) {
						return '';
					}

					return (
						<___>
							{this[beforeHooked]()}
							{this[renderHooked]()}
							{this[afterHooked]()}
						</___>
					);
				}
			}
		};
	}
}