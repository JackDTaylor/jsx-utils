export default () => {
	global.ClassUtils = class {
		static possibleConstructorReturn(self, call) {
			if(!self) {
				throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
			}

			return call && (typeof call === "object" || typeof call === "function") ? call : self;
		}

		static classCallCheck(instance, Constructor) {
			if(!(instance instanceof Constructor)) {
				throw new TypeError("Cannot call a class as a function");
			}
		}

		static inherits(subClass, superClass) {
			if(typeof superClass !== "function" && superClass !== null) {
				throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
			}

			subClass.prototype = Object.create(superClass && superClass.prototype, {
				constructor: {
					value: subClass,
					enumerable: false,
					writable: true,
					configurable: true
				}
			});

			if(superClass) {
				if(Object.setPrototypeOf) {
					Object.setPrototypeOf(subClass, superClass);
				} else {
					subClass.__proto__ = superClass;
				}
			}
		}

		static inheritsEx(subClass, superClass) {
			if(superClass) {
				ClassUtils.inherits(subClass, superClass);
			}

			return subClass;
		}

		static raw$useES6Classes = undefined;

		static checkIfShouldUseES6Classes() {
			if(isUndefined(ClassUtils.raw$useES6Classes)) {
				try {
					// This will fail if `class {}` was not processed by babel
					new (ClassUtils.createClass('TestClass', class {}, true));
					ClassUtils.raw$useES6Classes = false;
				} catch(error) {
					checkCaught(error);

					ClassUtils.raw$useES6Classes = true;
				}
			}

			return ClassUtils.raw$useES6Classes;
		}

		static createClass(className, superClass, forceDefaultBehavior = false) {
			if(forceDefaultBehavior == false && isUndefined(ClassUtils.raw$useES6Classes)) {
				ClassUtils.checkIfShouldUseES6Classes();
			}

			let result = null;

			className = `${className}`.replace(/[^$A-Z_0-9]/gi, '');

			if(!className) {
				className = 'anonymous';
			}

			if(forceDefaultBehavior || ClassUtils.raw$useES6Classes == false) {
				// Default behavior for Babel class implementation
				eval(`
					result = ClassUtils.inheritsEx(function ${className}() {
						ClassUtils.classCallCheck(this, ${className});
						
						if(superClass) {
							var proto = ${className}.__proto__ || Object.getPrototypeOf(${className});
							return ClassUtils.possibleConstructorReturn(this, proto.apply(this, arguments));
						}
					}, superClass);
				`);
			} else {
				// Default behavior does not work with ES6 classes.
				// It throws "constructor cannot be called without new", so
				// here's another implementation for such environments.
				eval(`result = class ${className} extends superClass {}`);
			}

			return result;
		}

		static applyMixin(BaseCls, Mixin) {
			Mixin = Mixin(BaseCls);

			let staticDescriptors = Object.getOwnPropertyDescriptors(Mixin);
			let prototypeDescriptors = Object.getOwnPropertyDescriptors(Mixin.prototype);

			delete staticDescriptors['prototype'];
			delete staticDescriptors['name'];
			delete staticDescriptors['length'];
			delete staticDescriptors['arguments'];
			delete staticDescriptors['caller'];

			delete prototypeDescriptors.constructor;

			// if(Object.keys(staticDescriptors).length > 0) {
			// 	for(const key of Object.keys(staticDescriptors)) {
			// 		console.log('static', key, JSON.stringify(staticDescriptors[key]));
			// 	}
			// }
			//
			// if(Object.keys(prototypeDescriptors).length > 0) {
			// 	for(const key of Object.keys(prototypeDescriptors)) {
			// 		console.log('proto', key, JSON.stringify(prototypeDescriptors[key]));
			// 	}
			// }

			if(Object.keys(staticDescriptors).length > 0) {
				Object.defineProperties(BaseCls, staticDescriptors);
			}

			if(Object.keys(prototypeDescriptors).length > 0) {
				Object.defineProperties(BaseCls.prototype, prototypeDescriptors);
			}

			return BaseCls;
		}

		static mapPrototypeTree(Cls, fn) {
			let prototype = Cls.prototype;
			let result = [];
			let doBreak = false;
			let breakFn = () => doBreak = true;

			while(prototype) {
				const value = fn(prototype.constructor, breakFn);

				if(doBreak) {
					break;
				}

				result.push(value);

				prototype = Object.getPrototypeOf(prototype);

				if(!prototype || !prototype.constructor) {
					break;
				}
			}

			return result;
		}


		static getStaticFromPrototypeTree(Cls, property, processor = x=>x) {
			const VOID = {};

			return ClassUtils.mapPrototypeTree(Cls, Class => {
				if(Object.getOwnPropertyDescriptor(Class, property)) {
					return processor(Class[property], Class);
				}

				return VOID;
			}).filter(x => x !== VOID);
		}
	};
}