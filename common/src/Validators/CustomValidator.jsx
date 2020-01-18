import Validator from "./Validator";

export default class CustomValidator extends Validator {
	fn;

	constructor(fn) {
		super();

		this.fn = fn;
	}

	validate() {
		return this.fn(...arguments);
	}
}