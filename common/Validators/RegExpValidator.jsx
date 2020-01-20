import Validator from "./Validator";

export default class RegExpValidator extends Validator {
	regex;

	constructor(regex) {
		super();

		this.regex = regex;
	}

	validate(value) {
		try {
			return this.regex.test(value);
		} finally {
			this.regex.lastIndex = 0;
		}
	}
}