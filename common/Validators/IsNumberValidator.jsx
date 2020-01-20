import Validator from "./Validator";

export default class IsNumberValidator extends Validator {
	validate(value) {
		return isFinite(parseFloat(value));
	}

	message() {
		return 'Здесь можно ввести только число';
	}
}