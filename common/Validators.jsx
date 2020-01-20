import Validator from "./Validators/Validator";
import IsNumberValidator from "./Validators/IsNumberValidator";
import IsEmailValidator from "./Validators/IsEmailValidator";
import IsPhoneValidator from "./Validators/IsPhoneValidator";
import RegExpValidator from "./Validators/RegExpValidator";
import CustomValidator from "./Validators/CustomValidator";
import IsPositiveValidator from "./Validators/IsPositiveValidator";
import IsIntegerValidator from "./Validators/IsIntegerValidator";
import MaxLengthValidator from "./Validators/MaxLengthValidator";
import PasswordValidator from "./Validators/PasswordValidator";
import DatasetValidator from "./Validators/DatasetValidator";
import IsNotEmptyValidator from "./Validators/IsNotEmptyValidator";

export default () => {
	global.Validate = class Validate {
		static IsNotEmpty(type = null) {
			return new IsNotEmptyValidator(type);
		}

		static get IsNumber() {
			return new IsNumberValidator;
		}

		static get IsEmail() {
			return new IsEmailValidator;
		}

		static get IsInteger() {
			return new IsIntegerValidator;
		}

		static get IsPositive() {
			return new IsPositiveValidator;
		}

		static get IsPhone() {
			return new IsPhoneValidator;
		}

		static get Password() {
			return new PasswordValidator;
		}

		static Dataset(provider) {
			return new DatasetValidator(provider);
		}

		static MaxLength(limit) {
			return new MaxLengthValidator(limit);
		}

		static RegExp(regex) {
			return new RegExpValidator(regex);
		}

		static Custom(fn) {
			return new CustomValidator(fn);
		}

		static async DoValidation(value, validators = []) {
			/** @type {Object} */
			let errors = [];

			for(let item of validators) {
				try {
					if(item instanceof Validator) {
						item = {validator:item, params: {}, customMessage: null };
					}

					const validator     = item.validator;
					const params        = item.params;
					const customMessage = item.customMessage;

					if(await validator.validate(value, params) == false) {
						let message = customMessage || validator.message;

						if(message instanceof Function) {
							message = message.apply(validator, [params, value]);
						}

						// noinspection ExceptionCaughtLocallyJS
						throw new Error(message);
					}
				} catch(error) {
					checkCaught(error);

					if(error instanceof ValidationError == false) {
						error = new ValidationError([error.message]);
					}

					const receivedArray = valueType(error.errors) == Array;
					const receivedObject = valueType(error.errors) == Object;

					const storedArray = valueType(errors) == Array;
					const storedObject = valueType(errors) == Object;

					if(receivedArray) {
						if(storedArray) {
							errors = errors.concat(error.errors);
						}

						if(storedObject) {
							errors.$$base = errors.$$base || [];
							errors.$$base.concat(error.errors);
						}
					}

					if(receivedObject) {
						if(storedArray) {
							// Replace array with object. Old errors are moved into `$$base`.
							const oldErrors = errors;
							errors = error.errors;

							if(!empty(oldErrors)) {
								errors.$$base = errors.$$base || [];
								errors.$$base.concat(oldErrors);
							}
						}

						if(storedObject) {
							// Merge two objects
							throw new Error('Ошибка алгоритма валидации: свяжитесь с администратором портала');
						}
					}
				}
			}

			return errors;
		}
	};
}