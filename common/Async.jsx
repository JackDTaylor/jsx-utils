export default () => {
	const Bluebird = global.JsxUtilsDependencies["bluebird"];

	global.Bluebird = Bluebird;
	global.Promise = Bluebird;

	global.Bluebird.config({
		cancellation: true,
		warnings: false,
		longStackTraces: false,
		monitoring: false
	});

	global.delay = function delay(timeout = 0) {
		if(valueType(timeout) == Function) {
			// noinspection JSCheckFunctionSignatures
			return setTimeout(timeout, 0);
		}

		return new Bluebird(function(resolve, reject, onCancel) {
			let id = setTimeout(() => {
				try {
					resolve();
				} catch(e) {
					reject(e);
				}
			}, timeout);

			onCancel(() => clearTimeout(id));
		});
	};

	global.promise = function promise(handler) {
		return new Bluebird(handler);
	};

	global.condition = function condition(callback, tickTime = 25) {
		let timePassed = 0;

		return new Bluebird(function(resolve, reject) {
			let intervalId = setInterval(() => safeResolve(() => {
				timePassed += tickTime;

				let value = callback(timePassed);

				if(value) {
					clearInterval(intervalId);
					safeResolve(resolve, reject, value);
				}
			}, reject), tickTime);
		});
	};

	global.safeResolve = function safeResolve(resolve, reject, ...resolveArgs) {
		try {
			return resolve(...resolveArgs);
		} catch(error) {
			return reject(error);
		}
	};

	global.awaitImmediate = function awaitImmediate(val, resolver) {
		if(val instanceof Bluebird && val.isFulfilled()) {
			resolver(val.value());
			return true;
		} else if(isPromise(val) == false) {
			resolver(val);
			return true;
		}
		// Either a regular promise or not resolved Bluebird
		val.then(resolver);
		return false;
	};
}