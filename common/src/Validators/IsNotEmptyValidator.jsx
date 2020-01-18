import Validator from "./Validator";

export default class IsNotEmptyValidator extends Validator {
	type;

	constructor(type = null) {
		super();
		this.type = type;
	}

	validate(value) {
		if(this.type && valueType(this.type['isValueEmpty']) == Function) {
			return !this.type['isValueEmpty'](value);
		}

		return !empty(value) && value;
	}

	message() {
		return REQUIRED_LABEL;
	}
}