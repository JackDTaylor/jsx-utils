export default () => {
	const jQuery      = global.JsxUtilsDependencies["jquery"];
	const querystring = global.JsxUtilsDependencies["querystring"];

	if('URL' in window == false) {
		window.URL = {};
	}

	let urlParser = document.createElement('a');

	(original => {
		jQuery.globalEval = function(code, doc, node) {
			console.log('globalEval', [...arguments]);

			if(code[0] == '{') {
				// Possibly a JSON, make it somewhat executable (to not throw an error atleast)
				code = '(' + code + ')';
			}

			return original.apply(this, [code, doc, node]);
		};
	})(jQuery.globalEval);


	class URLData {
		parser = null;

		protocol = '';
		hostname = '';
		port     = '';
		pathname = '';
		search   = '';
		hash     = '';

		constructor(url) {
			this.parser = document.createElement('a');
			this.parser.href = url;

			this.protocol = this.parser.protocol;
			this.hostname = this.parser.hostname;
			this.port     = this.parser.port;
			this.pathname = this.parser.pathname;
			this.search   = this.parser.search;
			this.hash     = this.parser.hash;
		}

		get href() {
			this.parser.protocol = this.protocol;
			this.parser.hostname = this.hostname;
			this.parser.port     = this.port;
			this.parser.pathname = this.pathname;
			this.parser.search   = this.search;
			this.parser.hash     = this.hash;

			return this.parser.href;
		}
	}

	window.URL.parseReadonly = function parseReadonly(url) {
		urlParser.href = url;

		return {
			href:     urlParser.href,
			protocol: urlParser.protocol,
			hostname: urlParser.hostname,
			port:     urlParser.port,
			pathname: urlParser.pathname,
			search:   urlParser.search,
			hash:     urlParser.hash
		};
	};

	window.URL.parse = function parse(url) {
		return new URLData(url);
	};
	window.URL.clean = function parse(url) {
		return '/' + url.trim('/').replace(/\/+/g, '/');
	};


	window.URL.build = function(baseUrl, params) {
		return `${baseUrl}?${querystring.stringify(params)}`;
	};

	window.URL.parseQuery = function(query) {
		return querystring.parse(query);
	};

	const abortStatuses = ["abort"];
	const errorStatuses = ['nocontent','error','timeout','parsererror'];
	const successStatuses = ['notmodified', 'success'];

	window.URL.fetch = function(url, method, body, outputFormat = 'json') {
		const handler = function(resolve, reject, onCancel) {
				let request = null;

				const ajaxHandler = (...args) => safeResolve(function(xhr, status) {
					if(abortStatuses.has(status)) {
						// Do something?
					}

					if(errorStatuses.has(status)) {
						if(xhr.status && xhr.responseJSON) {
							let error = null;

							if(xhr.responseJSON.meta) {
								let meta = xhr.responseJSON.meta;
								let errorConstructor = meta.$error;

								if(global[errorConstructor]) {
									errorConstructor = global[errorConstructor];

									try {
										error = new errorConstructor(...meta.$args);
									} catch(_e) {
										console.error(_e);
									}
								}
							}

							if(error == null) {
								error = new ApiError(xhr.responseJSON.errorMessage, xhr.status);
							}

							reject(error);
							return;
						}

						// retry
						if(--config.executionAttempts > 0) {
							return jQuery.ajax(config);
						}

						reject(new Error({
							nocontent:   'Получен пустой ответ от сервера',
							error:       'Ошибка при обработке запроса',
							timeout:     'Превышен интервал ожидания запроса',
							parsererror: 'Не удалось прочитать ответ сервера',
						}[status] || status));
					}

					if(status == "notmodified") {
						console.warn('NOTMODIFIED', xhr);
					}

					if(successStatuses.has(status)) {
						switch(outputFormat) {
							case 'json': return resolve(xhr.responseJSON);
							case 'text': return resolve(xhr.responseText);
						}

						return resolve(xhr.response);
					}

					reject(new Error("Unable to resolve a promise for unknown reason"));
				}, reject, ...args);

				if(method != RequestType.GET && valueType(body) != String) {
					body = JSON.stringify(body);
				}

				let config = {
					url, method,
					data: body,
					dataType: 'json',
					contentType: 'application/json',
					complete: ajaxHandler,
					executionAttempts: 5
				};

				request = jQuery.ajax(config);

				onCancel(() => request.abort());
		};

		return new Bluebird(handler);
	};

	window.URL.fetchRaw = function(url, method, data, config = {}) {
		return new Bluebird(function(resolve, reject, onCancel) {
			config = {
				url, method, data,
				dataType: 'json',
				jsonp: false,
				complete: xhr => successStatuses.has(status) ? resolve(xhr) : reject(xhr),
				...config
			};
			let request = jQuery.ajax(config);
			onCancel(fn => request.abort());
		});
	};
}