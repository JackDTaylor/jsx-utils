import Validator from "./Validator";

export default class IsEmailValidator extends Validator {
	validate(value) {
		let cleanEmail = `${value}`.trim();
		return cleanEmail && cleanEmail.indexOf('@') > 0;
	}

	message() {
		return "Адрес электронной почты должен содержать символ @";
	}
}