export default () => {
	const {reactComponentPrefix} = this.cfg;

	const USE_NEW_LIFECYCLE_METHODS = (([major, minor]) => {
		// noinspection JSValidateTypes
		return major > 16 || (major == 16 && minor >= 9)
	})(React.version.split('.').map(x => parseInt(x)));

	const camelHumpRegex      = /([a-z0-9])([A-Z])/g;
	const classObjToClassname = function(cls) {
		// Get array of present classes and `undefined`s
		// Filter `undefined`s
		// Join into a string since we want only strings in result

		return keys(cls)
			.map(key => cls[key] && `js--${key}`)
			.filter(x=>x)
			.join(' ');
	};
	const classToClassname    = function(cls, isComponent = true) {
		if(typeof cls == 'object') {
			cls = classObjToClassname(cls);
		} else if(isComponent) {
			cls = cls.replace(camelHumpRegex, '$1-$2');
			cls = cls.toLowerCase();
			cls = `${reactComponentPrefix}-${cls}`;
		}

		return cls;
	};
	const rawClassname        = cls => classToClassname(cls, false);
	const componentClassname  = cls => classToClassname(cls, true);

	const getMergedPropValue  = function(prop, value, prevValue) {
		if(!prevValue) {
			return value;
		}

		if(prop == 'className') {
			return [prevValue, value].exceptEmpty().join(' ');
		}

		if(/^on[A-Z]/.test(prop) || prop == 'ref') {
			if(prop == 'ref') {
				if(valueType(prevValue) == Object) {
					const refObject = prevValue;
					prevValue = e => refObject.current = e;
				}

				if(valueType(value) == Object) {
					const refObject = value;
					value = e => refObject.current = e;
				}
			}

			return function() {
				prevValue.apply(this, arguments);
				value.apply(this, arguments);
			};
		}

		return value;
	};

	class ErrorBoundary extends React.Component {
		@state hasError = false;
		@state error = null;

		componentDidCatch(error/*, info*/) {
			this.error = error;
			// console.error(info);
		}

		static getDerivedStateFromError(error) {
			return { hasError: true, error };
		}

		render() {
			if(this.error) {
				return <b title={this.error}>[Ошибка]</b>;
			}

			return this.props.children;
		}
	}

	class ReactComponent extends React.Component {
		// noinspection JSUnusedLocalSymbols
		static CreateContext(defaultValue, extend = x => x) {
			const Context = React.createContext(defaultValue);

			// noinspection JSUnusedLocalSymbols
			Context.ReactComponent = extend(class ContextConsumer$Implementation extends ContextConsumer {
				static CssClasses = [];

				static get Context() {
					return Context;
				}

				static get ContextConsumer() {
					return this.Context['Consumer'];
				}
			});

			return Context;
		}

		/** @type String[] */
		get cssClass() {
			let obj = this.constructor.prototype;
			let names = [];

			while(obj) {
				let classes = [obj.constructor.name];

				if(Object.getOwnPropertyNames(obj.constructor).has('CssClasses')) {
					classes = obj.constructor.CssClasses;
				}

				names = names.concat(classes);

				obj = Object.getPrototypeOf(obj);

				if(!obj.constructor || !obj.constructor.name || obj.constructor == ReactComponent) {
					break;
				}
			}

			for(const trait of this._traits) {
				names = names.concat(trait.constructor.name);
			}

			return names;
		};

		/** @type String[] */
		get additionalClasses() { return []; }

		get style() {
			return { style: this.props && this.props.style }
		}

		ref = {};
		_rootRef = React.createRef();

		/** @type {Element} */
		get rootRef() {
			return this._rootRef && this._rootRef.current;
		}

		rootProps(additionalClasses = []) {
			additionalClasses = this.additionalClasses.concat(additionalClasses).map(rawClassname);

			if(this.props && this.props.classes && this.props.classes.root) {
				additionalClasses.push(this.props.classes.root);
			}

			const result = {
				className: reactComponentPrefix + ' ' + (
					this.cssClass
						.map(componentClassname)                          // Convert `SomeClass` to `{reactComponentPrefix}-some-class`
						.concat(additionalClasses)                        // Add `additionalClasses`
						.concat([this.props.className])                   // Add `props.className`
						.filter(x=>x && x.trim() != reactComponentPrefix) // Remove empty classes and `reactComponentPrefix` occurrences
						.unique()                                         // Remove duplicates
						.join(' ')                                        // Join everything into a string
						.replace(/\s+/, ' ')                              // Collapse spaces
						.trim()                                           // Trim spaces from begin and end
				),
				...this.traitProps
			};

			if(this.useInternalRef) {
				result._internalRef = this._rootRef;
			}

			return result;
		}

		get useInternalRef() {
			return this._traits.length > 0;
		}

		get traitProps() {
			const result = {};

			for(const trait of this._traits) {
				const props = trait.rootProps;

				for(const prop of keys(props)) {
					result[prop] = getMergedPropValue(prop, props[prop], result[prop]);
				}
			}

			return result;
		}

		get computedCls() {
			return this.rootProps().className;
		}

		get cls() {
			return this.rootProps();
		}

		withCls(additional = []) {
			return this.rootProps(additional);
		}

		_traits = [];

		_subscriptions = [];

		subscribe(observable, handler = null, showWarnings = true) {
			if(!isObservable(observable)) {
				console.warn('Value you\'re passed to subscribe() is not an observable');
				return;
			}

			if(!handler) {
				if(this[observable.$$name]) {
					handler = (...args) => this[observable.$$name](...args);
				} else {
					if(showWarnings) {
						console.warn(`No handler was provided or found for subscribing to ${observable.$$name} in ${this.constructor.name}`);
					}

					handler = () => {};
				}
			}

			this._subscriptions.push(observable(handler));
		}

		softSubscribe(observable, handler = null) {
			return this.subscribe(observable, handler, false);
		}

		subscribeProps(observable) {
			if(!isObservable(observable)) {
				console.warn('Value you\'re passed to subscribeProps() is not an observable');
				return;
			}

			if(observable.$$name in this.props) {
				this.subscribe(observable, this.props[observable.$$name]);
			}
		}

		subscribeToProp(observable) {
			if(!isObservable(observable)) {
				console.warn('Value you\'re passed to subscribeToProp() is not an observable');
				return;
			}

			if(this[observable.$$name]) {
				this.subscribe(observable, this[observable.$$name]);
			}
		}

		triggerTraitLifecycleMethod(method, container, ...args) {
			for(const trait of this._traits) {
				trait[method].apply(trait, [container, ...args]);
			}
		}

		_internalComponentWillInit() {
			this.triggerTraitLifecycleMethod('componentWillInit', this);
		}

		_internalComponentWillMount() {
			this.triggerTraitLifecycleMethod('componentWillMount', this);
		}
		_internalComponentDidMount() {
			this.triggerTraitLifecycleMethod('componentDidMount', this);
		}
		_internalComponentDidPrepare() {
			this.triggerTraitLifecycleMethod('componentDidPrepare', this);
		}

		// _internalComponentWillReceiveProps() {}
		// _internalComponentWillUpdate() {}
		// _internalComponentDidUpdate() {}

		_willUnmount = false;

		_internalComponentWillUnmount() {
			this.triggerTraitLifecycleMethod('componentWillUnmount', this);

			this._willUnmount = true;

			if(this.asyncPromise) {
				this.asyncPromise.cancel();
				this.asyncPromise = null;
			}

			for(const unsubscribeFn of this._subscriptions) {
				unsubscribeFn();
			}
		}

		static getDerivedStateFromProps(props, state) {
			return state;
		}

		getInitialState() {
			return {};
		}

		componentWillInit() {}
		componentDidMount() {}
		componentDidPrepare() {}
		componentDidUpdate() {}
		componentWillUnmount() {}

		shouldComponentUpdate(nextProps, nextState) {
			return Object.equal(this.props, nextProps) == false || Object.equal(this.state, nextState) == false;
		}

		@state isAsyncReady = true;
		asyncPromise = null;

		renderAsyncLoader() {
			return <div className={`${reactComponentPrefix} ${reactComponentPrefix}-block-loader`} />;
		}

		_callPrepare() {
			return this.prepare();
		}

		_handleAsyncPrepare() {
			this.asyncPromise = this._callPrepare();

			if(this.asyncPromise instanceof Function) {
				this.asyncPromise = this.asyncPromise();
			}

			if(isPromise(this.asyncPromise) == false) {
				this.asyncPromise = null;
				setTimeout(() => this.componentDidPrepare(), 0);
				return;
			}

			this.isAsyncReady = false;

			// If prepare() returns a promise (so it was overriden with `async` modifier)
			// then keep it and schedule update when it's done
			this.asyncPromise.then(() => {
				this.isAsyncReady = true;
				this.asyncPromise = null;
				setTimeout(() => this.componentDidPrepare(), 0);
			});

			// Replace actual render() function with it's async wrapper
			const actualRender = this.render;
			this.render = function fakeRender() {
				// noinspection JSPotentiallyInvalidUsageOfClassThis
				if(this.isAsyncReady == false) {
					// noinspection JSPotentiallyInvalidUsageOfClassThis
					return this.renderAsyncLoader();
				}

				return actualRender.apply(this, arguments);
			};
		}

		_defineInitialState() {
			this.state = this.getInitialState();

			if(this.props && this.props['initialState']) {
				this.state = this.props['initialState'];
			}
		}

		_updateSnapshot = {};

		get updateSnapshot() {
			return this._updateSnapshot;
		}

		_wrapMethod(methodName, beforeCall = null, afterCall = null, callerGenerator = null) {
			beforeCall = beforeCall || (()=>{});
			afterCall  = afterCall  || (()=>{});

			let originalCall = this[methodName];

			if(!originalCall) {
				console.warn(`_wrapMethod() target ${methodName} does not exist`);
				originalCall = () => {};
			}

			if(!callerGenerator) {
				callerGenerator = (beforeCall, originalCall, afterCall) => {
					return function() {
						beforeCall.apply(this, arguments);
						const result = originalCall.apply(this, arguments);
						afterCall.apply(this, arguments);
						return result;
					}
				}
			}

			this[methodName] = callerGenerator(beforeCall, originalCall, afterCall);
		}

		_wrapLifecycleMethods() {
			let methods = {
				// Custom lifecycle
				componentWillInit:        '_internalComponentWillInit',

				// New lifecycle methods
				getSnapshotBeforeUpdate:   '_internalGetSnapshotBeforeUpdate',

				// Old lifecycle methods
				componentWillMount:        '_internalComponentWillMount',
				componentWillReceiveProps: '_internalComponentWillReceiveProps',
				componentWillUpdate:       '_internalComponentWillUpdate',

				// Common lifecycle
				componentDidMount:         '_internalComponentDidMount',
				componentDidPrepare:       '_internalComponentDidPrepare',
				componentDidUpdate:        {
					overrideName: '_internalComponentDidUpdate',
					callGenerator(beforeCall, originalCall, afterCall) {
						return function() {
							// noinspection JSPotentiallyInvalidUsageOfClassThis
							const snapshot = this._updateSnapshot;
							// noinspection JSPotentiallyInvalidUsageOfClassThis
							this._updateSnapshot = {};

							const args = [...arguments];
							args[2] = snapshot;

							beforeCall.apply(this, args);
							const result = originalCall.apply(this, args);
							afterCall.apply(this, args);
							return result;
						}
					}
				},
				componentWillUnmount:      '_internalComponentWillUnmount',
			};

			if(USE_NEW_LIFECYCLE_METHODS) {
				delete methods.componentWillMount;
				delete methods.componentWillReceiveProps;
				delete methods.componentWillUpdate;
			} else {
				delete methods.getSnapshotBeforeUpdate;
			}

			for(let methodName of keys(methods)) {
				let method = methods[methodName];
				let callGenerator = null;

				if(valueType(method) == Object) {
					callGenerator = method.callGenerator;
					method = method.overrideName;
				}

				this._wrapMethod(methodName, null, this[method], callGenerator);
			}
		}

		_initializeRefs() {
			if(!this.constructor.Refs) {
				return;
			}

			for(const refName of this.constructor.Refs) {
				this.createRef(refName);
			}
		}

		createRef(name, skipProperty = false) {
			if(name in this.ref) {
				console.warn('Attempting to rewrite ref ', name, 'in', this);
				return;
			}

			this.ref[name] = React.createRef();

			if(!skipProperty) {
				Object.defineProperty(this, name, {
					configurable: true,
					get() {
						return this.ref[name].current;
					}
				});
			}

			return this.ref[name];
		}

		_initializeTraits() {
			if(!this.constructor.Traits) {
				return;
			}

			for(const {Trait, settings} of this.constructor.Traits) {
				this._traits.push(new Trait(this, settings));
			}
		}

		constructor(...args) {
			super(...args);

			this._wrapLifecycleMethods();
			this._initializeRefs();
			this._initializeTraits();
			this._defineInitialState();
			this._handleAsyncPrepare();

			this.componentWillInit();
		}

		// Note that this version of prepare() is synchronous.
		// It can be overriden with async version and ReactComponent will handle the rest.
		prepare() {}

		render() {
			return '[ no render() ]';
		}
	}

	if(USE_NEW_LIFECYCLE_METHODS) {
		ReactComponent.prototype.getSnapshotBeforeUpdate = function getSnapshotBeforeUpdate() {
			return null;
		};
	} else {
		ReactComponent.prototype.componentWillMount = function componentWillMount() {};
		ReactComponent.prototype.componentWillReceiveProps = function componentWillReceiveProps() {};
		ReactComponent.prototype.componentWillUpdate = function componentWillUpdate() {};
	}

	class ContextConsumer extends ReactComponent {
		static CssClasses = [];
		static IsContexted = true;

		static ContextualRender(result, context, data) {
			return <ErrorBoundary>{result}</ErrorBoundary>;
		}

		@prop consumedContext;
		@prop isContexted;

		get actualProps() {
			const {consumedContext, isContexted, contextualRef, nonContextable, ...restProps} = this.props;
			return restProps;
		}
	}

	class ReactTrait {
		constructor(container, settings = {}) {
			this.container = container;
			this.settings = settings;
		}

		get rootRef() {
			return this.container && this.container.rootRef;
		}

		componentWillInit() {}
		componentDidMount() {}
		componentWillUnmount() {}

		get rootProps() {
			return {};
		}
	}

	if(!USE_NEW_LIFECYCLE_METHODS) {
		ReactTrait.prototype.componentWillMount = function componentWillMount() {}
	}

	global.useTrait = function useTrait(Trait, settings = {}) {
		return function(Class) {
			if(!Class.Traits) {
				Object.defineProperty(Class, 'Traits', {value: []});
			}

			Class.Traits.push({Trait, settings});

			return Class;
		}
	};

	global.ReactTrait = ReactTrait;
	global.ErrorBoundary = ErrorBoundary;
	global.ReactComponent = ReactComponent;
	global.ContextConsumer = ContextConsumer;
}