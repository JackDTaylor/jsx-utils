export default () => {
	Object.defineProperty(global.Error.prototype, 'constructorArgs', {
		enumerable: false,
		configurable: true,
		get() { return [this.message]; }
	});

	Object.defineProperty(global.Error.prototype, 'defaultErrorCode', {
		enumerable: false,
		configurable: true,
		get() { return 500; }
	});

	Object.defineProperty(global.Error.prototype, 'code', {
		enumerable: false,
		configurable: true,
		get() { return this._code || this.defaultErrorCode; },
		set(value) { this._code = value; }
	});

	Object.defineProperty(global.Error.prototype, 'toJSON', {
		enumerable: false,
		configurable: true,
		value() {
			return {
				$error: this.constructor.name,
				$args: this.constructorArgs,
			};
		}
	});

	class ApiError extends Error {
		message;

		_code;

		get defaultErrorCode() {
			return 500;
		}

		constructor(message, code = null) {
			super();

			this.code = code || this.defaultErrorCode;
			this.message = message;
		}

		get constructorArgs() {
			return [this.message, this.code];
		}
	}

	/**
	 * Knex DB query error
	 */
	class QueryError extends ApiError {
		message;
		builder;

		sqlMessage;
		code;
		errno;
		sqlState;

		sql;
		bindings;

		constructor(builder, error) {
			super('SQL Error: ' + error.sqlMessage);

			this.builder = builder;

			const {sql, bindings} = builder.compiled;

			this.sql = sql;
			this.bindings = bindings;

			this.sqlMessage = error.sqlMessage;
			this.sqlCode    = error._code;
			this.errno      = error.errno;
			this.sqlState   = error.sqlState;
		}
	}

	class AuthRequiredError extends ApiError {
		get defaultErrorCode() {
			return 403;
		}

		constructor(message) {
			super();
			this.message = message || `Auth required`;
		}
	}

	class CommitError extends ApiError {
		constructor(message, code) {
			super(message || "Ошибка сохранения данных", code);
		}
	}

	class ValidationError extends CommitError {
		errors = {};

		get defaultErrorCode() {
			return 422;
		}

		constructor(errors) {
			super();

			this.message = "Ошибка при проверке данных";
			this.errors = errors;
		}

		get constructorArgs() {
			return [this.errors];
		}
	}

	class AccessError extends CommitError {
		get defaultErrorCode() {
			return 403;
		}

		constructor(message) {
			super();

			this.message = message || `Недостаточно прав для совершения данного действия`;
		}
	}

	class ModelReferenceError extends CommitError {
		get defaultErrorCode() {
			return 422;
		}

		constructor(error, showDetails = false) {
			super();

			this.message = "Невозможно выполнить операцию, поскольку на эту запись ссылаются другие";

			if(showDetails) {
				this.message += `\n[${error.message}]`;
			}
		}
	}

	class ModelUniqueKeyError extends CommitError {
		get defaultErrorCode() {
			return 422;
		}

		constructor(error, code, showDetails = false) {
			super();

			let message = "Невозможно выполнить операцию, поскольку одно из заполненных полей содержит неуникальное значение";

			if(showDetails) {
				message += `\n[${error.message}]`;
			}

			this.message = message;
		}
	}

	Object.defineProperty(global, 'ErrorValue', {
		value(errorMessage) {
			if('Proxy' in global) {
				return new Proxy({}, { get() { throw new Error(errorMessage) } });
			}

			return { valueOf() { throw new Error(errorMessage) } };
		}
	});

	global.ApiError = ApiError;
	global.QueryError = QueryError;
	global.AuthRequiredError = AuthRequiredError;
	global.CommitError = CommitError;
	global.ValidationError = ValidationError;
	global.AccessError = AccessError;
	global.ModelReferenceError = ModelReferenceError;
	global.ModelUniqueKeyError = ModelUniqueKeyError;

	global.checkCaught = function(error) {
		if(error && error['isFlowInterrupter']) {
			throw error;
		}
	};
}