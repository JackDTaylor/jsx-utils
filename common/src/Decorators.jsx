import JsxUtilsModule from "../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	*dependencies() {
		yield "common.Utils.CacheStorage";
	}

	import() {
		global.DecoratorUtils = class DecoratorUtils {
			static defineKey(key, container, value = {}) {
				container[key] = container[key] || value;

				return container;
			}

			static getDescriptorValue(descriptor, getterPrototype = undefined, defaultValue = undefined) {
				if(descriptor.value) {
					return descriptor.value;
				}

				if(descriptor.initializer) {
					return descriptor.initializer();
				}

				if(descriptor.get && !isUndefined(getterPrototype)) {
					return descriptor.get.apply(getterPrototype);
				}

				return defaultValue;
			}

			static getInitialValue(proto, field, descriptor, defaultValue = undefined) {
				if('value' in descriptor) {
					return descriptor.value;
				}

				if(field in proto) {
					return proto[field];
				}

				if(descriptor.initializer) {
					return descriptor.initializer();
				}

				return defaultValue;
			}

			static wrapper(fn = x=>x, defaultValue = undefined) {
				return (proto, field, descriptor) => {
					const originalValue = DecoratorUtils.getInitialValue(proto, field, descriptor, defaultValue);

					return (originalValue => {
						originalValue = fn(originalValue, proto, field, descriptor);

						return { value: originalValue, configurable: true };
					})(originalValue);
				};
			}

			/**
			 * defineProperty(key, value) is a decorator function to define a key in decorated value
			 *
			 * @param key {String} key to define
			 * @param value {*} value to set the defined key to
			 * @return {Function} The resulting decorator function, that will define a key
			 * @decorator
			 * @example
			 * <pre>
			 * const hidden = defineProperty('isHidden', true);
			 *
			 * class MyClass {
			 *   @defineProperty('myKey', 32)
			 *   @hidden
			 *   myConfigObject = {
			 *     someAnotherKey: 64
			 *   }
			 * }
			 *
			 * // `myConfigObject` will be the same as this:
			 * let a = {
			 *   someAnotherKey: 64,
			 *   isHidden: true,
			 *   myKey: 32
			 * };
			 * </pre>
			 */
			static defineProperty(key, value) {
				return DecoratorUtils.wrapper(initialValue => {
					initialValue[key] = initialValue[key] || value;

					return initialValue;
				}, {});
			}

			static getPropertyMeta(proto, field, metaKey) {
				return DecoratorUtils.getPropertyMetas(proto, field)[metaKey];
			}

			static getPropertyMetas(proto, field) {
				if('$PropertyMeta' in proto.constructor == false) {
					return {};
				}

				return proto.constructor.$PropertyMeta[field] || {};
			}

			static setPropertyMeta(proto, field, key, value) {
				if('$PropertyMeta' in proto.constructor == false) {
					Object.defineProperty(proto.constructor, '$PropertyMeta', {
						value: {},
						configurable: false,
						enumerable: false,
						writable: false,
					});
				}

				if(field in proto.constructor.$PropertyMeta == false) {
					proto.constructor.$PropertyMeta[field] = {};
				}

				proto.constructor.$PropertyMeta[field][key] = value;
			}

			static defineInPropertyMeta(values = {}, singleValue = undefined) {
				if(valueType(values) == String) {
					// For defineInPropertyMeta(key, value) signature
					values = {[values]: singleValue};
				}

				return function(proto, field, descriptor) {
					for(const key of keys(values)) {
						DecoratorUtils.setPropertyMeta(proto, field, key, values[key]);
					}

					return descriptor;
				}
			}
		};

		global.defineProperty = DecoratorUtils.defineProperty;
		global.defineInPropertyMeta = DecoratorUtils.defineInPropertyMeta;

		global.abstract = function(proto, field) {
			return {
				get() {
					const name = valueType(this) == Function ? this.name : this.constructor.name;
					throw new Error(`${name}::${field} is marked as abstract and should be overriden`);
				},

				set(value) {
					Object.defineProperty(this, field, {
						value,
						writable: true,
						enumerable: true,
						configurable: true
					});
				}
			};
		};

		global.executeOnce = DecoratorUtils.wrapper((original, prototype, field) => {
			return function() {
				const executedKey = `${field}$${PrototypeUID(prototype)}$wasExecuted`;

				if(this[executedKey]) {
					return;
				}

				Object.defineProperty(this, executedKey, {
					value: true,
					enumerable: false,
					configurable: false,
					writable: false,
				});

				return original.apply(this, arguments);
			}
		});

		global.observable = function observable(proto, field) {
			const key = `${field}$observable`;

			const createObservableFn = function(field) {
				let handlers = [];

				const observableFn = function(handler) {
					if(handler instanceof Function == false) {
						console.warn('Trying to subscribe to observable with a non-function. If you\'re trying to invoke it, use .invoke() or .invokeAsync() instead');
						return;
					}

					handlers.push(handler);

					return () => observableFn.unsubscribe(handler);
				};

				Object.defineProperty(observableFn, '$$name', {value: field});
				Object.defineProperty(observableFn, '$$observable', {value: true});

				observableFn.invoke = function() {
					for(const handler of handlers) {
						handler.apply(this, arguments);
					}
				};

				observableFn.invokeAsync = async function() {
					for(const handler of handlers) {
						await handler.apply(this, arguments);
					}
				};

				observableFn.unsubscribe = function(handler) {
					handlers = handlers.filter(h => h != handler);
				};

				return observableFn;
			};

			return {
				get() {
					if(empty(this[key])) {
						this[key] = createObservableFn(field);
					}

					return this[key];
				},
				configurable: true,
			};
		};

		global.observable.createIn = function(targetObject, name) {
			Object.defineProperty(targetObject, name, observable(targetObject, name));
		};

		global.isObservable = function isObservable(value) {
			return value && value.$$observable;
		};

		global.observed = function(proto, field, descriptor) {
			let initialValue = DecoratorUtils.getInitialValue(proto, field, descriptor);
			const key = `${field}$rawValue`;

			const onBeforeEvent = `onBefore${field.ucFirst()}Change`;
			const onAfterEvent = `onAfter${field.ucFirst()}Change`;

			const invokeEvent = (object, eventKey, args) => {
				const event = object[eventKey];
				let eventResult;

				if(isObservable(event)) {
					eventResult = event.invoke.apply(object, args);
				} else if(event) {
					eventResult = event.apply(object, args);
				}

				return eventResult;
			};

			Object.defineProperty(proto, key, {
				enumerable: false,
				configurable: false,
				writable: true,
				value: initialValue,
			});

			return {
				configurable: true,
				get() {
					return this[key];
				},

				set(value) {
					if(invokeEvent(this, onBeforeEvent, [value]) === false) {
						return;
					}

					this[key] = value;

					invokeEvent(this, onAfterEvent, [value])
				}
			};

		};

		global.cached = function(proto, field, descriptor) {
			const key = `${field}$cachedResult`;
			const type = 'get' in descriptor ? 'get' : 'value';

			let getter;

			if(type == 'get') {
				// For `@cached get ...`
				getter = descriptor.get;
			} else {
				getter = DecoratorUtils.getInitialValue(proto, field, descriptor, ()=>{});
			}

			return {
				configurable: descriptor.configurable,
				enumerable: descriptor.enumerable,

				[type]: function() {
					if(!this[key]) {
						let value = getter.apply(this, arguments);

						if(isPromise(value)) {
							// For `@cached async ...`
							this[key] = (async() => this[key] = await value)(value)
						} else {
							this[key] = value;
						}
					}

					return this[key];
				}
			}
		};

		global.named = (...names) => Cls => {
			if(!global.Noun) {
				throw new Error("Module `common.Utils.Noun` is not imported");
			}

			/** @type Noun */
			Cls.Name = new Noun(...names);
			return Cls;
		};

		global.reactified = function(Cls) {
			Cls.prototype['@@iterator'] = function*() {
				const reactifier = this.toReact || (() => <b>[{this.constructor.name}::toReact]</b>);

				yield (
					<React.Fragment key={0}>
						{reactifier.apply(this)}
					</React.Fragment>
				);
			}
		};

		global.internal = function internal(proto, field, descriptor) {
			let value = DecoratorUtils.getInitialValue(proto, field, descriptor, () => '');

			return {
				get: () => value,
				set: v  => value = v,
				enumerable: false,
			};
		};

		global.locked = function locked(lockName) {
			if(arguments.length == 3) {
				return locked('_isLocked')(...arguments);
			}

			return DecoratorUtils.wrapper(originalCall => async function() {
				if(this[lockName]) {
					return;
				}

				this[lockName] = true;

				await delay();
				const result = await originalCall.apply(this, arguments);

				this[lockName] = false;

				return result;
			})
		};

		global.bound = function(proto, field, descriptor) {
			let originalCall = DecoratorUtils.getInitialValue(proto, field, descriptor, () => {});

			if(originalCall instanceof Function == false) {
				console.error(`Value passed to \`@bound ${field}\` is not a function`);
			}

			let boundKey = `${field}$bound`;

			return (originalCall => ({
				configurable: descriptor.configurable,
				enumerable: descriptor.enumerable,

				get() {
					if(!this[boundKey]) {
						this[boundKey] = originalCall.bind(this);
					}

					return this[boundKey];
				}
			}))(originalCall);
		};

		/**
		 * @decorator solo (also known as @debounce)
		 * Legend:
		 *   | Event
		 *   _ Decorator delay
		 *   # Function execution
		 *   C Cancelled function call
		 *   ^ Delay duration highlight
		 *
		 * With ||| delay:
		 *   Events:  ||||||||||||
		 *   Calls:   ______________###
		 *                       ^^^
		 *
		 * Without delay:
		 *   Events:  ||||||||||||
		 *   Calls:   CCCCCCCCCCC###
		 */
		global.solo = function(_delay = 0) {
			_delay = arguments.length < 2 ? _delay : 0;

			const decorator = function(proto, field, descriptor) {
				let originalCall = DecoratorUtils.getInitialValue(proto, field, descriptor, () => {});
				let promiseKey = `${field}$soloPromise`;

				if(originalCall instanceof Function == false) {
					console.error(`Value passed to \`@solo ${field}\` is not a function`);
				}

				return {
					configurable: descriptor.configurable,
					enumerable: descriptor.enumerable,

					value(...args) {
						if(this[promiseKey] && this[promiseKey].cancel) {
							this[promiseKey].cancel();
						}

						this[promiseKey] = (async() => {
							if(_delay >= 0) {
								await delay(_delay);
							}

							return await originalCall.apply(this, args);
						})();
						return this[promiseKey];
					}
				};
			};

			if(arguments.length > 1) {
				return decorator(...arguments);
			}

			return decorator;
		};

		/**
		 * @decorator cooldown (also known as @throttle)
		 * WARNING: Function return is intentionally omitted since we can't return value from delayed call
		 * Legend: see @solo decorator
		 *
		 * With |||| interval
		 *   Events:  ||||||||||||||
		 *   Calls:   ##__##__##__##__##
		 *            ^^^^
		 */
		global.cooldown = function(interval = 33) {
			interval = arguments.length < 2 ? interval : 33;

			const decorator = function(proto, field, descriptor) {
				let originalCall = DecoratorUtils.getInitialValue(proto, field, descriptor, () => {});
				let promiseKey = `${field}$cooldownPromise`;
				let lastCallKey = `${field}$cooldownLastCall`;

				if(originalCall instanceof Function == false) {
					console.error(`Value passed to \`@cooldown ${field}\` is not a function`);
				}

				return {
					configurable: descriptor.configurable,
					enumerable: descriptor.enumerable,

					value(...args) {
						const date = Date.now();

						if(this[promiseKey]) {
							this[promiseKey].cancel();
						}

						if(this[lastCallKey] && date - this[lastCallKey] < interval) {
							const timeRemaining = this[lastCallKey] + interval - date;

							this[promiseKey] = (async() => {
								// Delay for the remaining time
								await delay(timeRemaining);

								this[promiseKey] = null;

								this[lastCallKey] = Date.now();
								originalCall.apply(this, args);
							})();

							return;
						}

						this[promiseKey] = null;
						this[lastCallKey] = date;
						return originalCall.apply(this, args);
					}
				};
			};

			if(arguments.length > 1) {
				return decorator(...arguments);
			}

			return decorator;
		};

		/**
		 * @decorator sifter
		 * WARNING: Function return is intentionally omitted since we can't return value from delayed call
		 * Legend: see @solo decorator
		 *
		 * With |||| interval
		 *   Events:  ||||||||||||||
		 *   Calls:   ##__##__##__##__##
		 *            ^^^^
		 */
		global.sifter = function(interval = 33, returnValue = () => undefined) {
			interval = arguments.length < 3 ? interval : 33;
			returnValue = arguments.length < 3 ? returnValue : () => undefined;

			const decorator = function(proto, field, descriptor) {
				let originalCall = DecoratorUtils.getInitialValue(proto, field, descriptor, () => {});
				let lastCallKey = `${field}$sifterLastCall`;

				if(originalCall instanceof Function == false) {
					console.error(`Value passed to \`@sifter ${field}\` is not a function`);
				}

				return {
					configurable: descriptor.configurable,
					enumerable: descriptor.enumerable,

					value(...args) {
						const date = Date.now();

						if(this[lastCallKey] && date - this[lastCallKey] < interval) {
							return returnValue.apply(this, [this, ...args]);
						}

						this[lastCallKey] = date;
						return originalCall.apply(this, args);
					}
				};
			};

			if(arguments.length > 1) {
				return decorator(...arguments);
			}

			return decorator;
		};

		global.backendOnly = DecoratorUtils.wrapper(originalCall => function() {
			if(IsBackend == false) {
				throw new Error('This function can be called only in backend environment');
			}

			return originalCall.apply(this, arguments);
		});

		global.frontendOnly = DecoratorUtils.wrapper(originalCall => function() {
			if(IsFrontend == false) {
				throw new Error('This function can be called only in frontend environment');
			}

			return originalCall.apply(this, arguments);
		});
	}
}