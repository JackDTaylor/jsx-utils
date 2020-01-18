import Validator from "./Validator";

/**
 * @global
 * @var DatasetProviders {Object}
 */
/**
 * @typedef DatasetProvider
 * @method FromObject(object)
 */
 /**
 * @typedef DatasetProvider
 * @method GetType(typeName)
 */

export default class DatasetValidator extends Validator {
	/**
	 * Dataset provider
	 * @type {DatasetProvider}
	 */
	provider;

	constructor(provider) {
		if('DatasetProviders' in global == false) {
			throw new Error("global.DatasetProviders is not defined. You can't use DatasetValidator without it");
		}

		super();
		this.provider = global.DatasetProviders[provider];
	}

	async validate(value) {
		if(valueType(value) != Object || empty(value.type)) {
			throw new ValidationError(REQUIRED_LABEL);
		}

		if(!this.provider) {
			throw new ValidationError('Поле настроено неправильно: неизвестный провайдер');
		}

		const type = this.provider.GetType(value.type);
		const object = this.provider.FromObject(value);

		if(!type) {
			throw new ValidationError('Поле настроено неправильно: неизвестный тип данных');
		}

		const entries = await Promise.all(Array.from(object.validate()));
		const fieldErrors = {};
		const formErrors = [];

		for(let entry of entries) {
			entry = await entry;

			if(valueType(entry) == Object) {
				for(const field of keys(entry)) {
					fieldErrors[field] = fieldErrors[field] || [];

					let fieldEntry = await entry[field];

					if(fieldEntry instanceof Validator) {
						fieldEntry = await Validate.DoValidation(object[field], [fieldEntry]);
					}

					if(valueType(fieldEntry) != Array) {
						fieldEntry = [fieldEntry];
					}

					fieldErrors[field].push(...fieldEntry);
				}
			} else if(valueType(entry) == Array) {
				formErrors.push(...entry);
			} else {
				formErrors.push(entry);
			}
		}

		const errors = {};
		let hasErrors = false;

		if(!empty(formErrors)) {
			hasErrors = true;
			errors.$$base = formErrors;
		}

		for(const field of keys(fieldErrors)) {
			if(!empty(fieldErrors[field])) {
				hasErrors = true;

				errors.data = errors.data || {};
				errors.data[value.type] = errors.data[value.type] || {};
				errors.data[value.type][field] = fieldErrors[field];
			}
		}

		if(hasErrors) {
			throw new ValidationError(errors);
		}

		return true;
	}
}