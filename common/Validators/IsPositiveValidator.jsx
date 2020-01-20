import IsNumberValidator from "./IsNumberValidator";

export default class IsPositiveValidator extends IsNumberValidator {
	validate(value) {
		return super.validate(value) && value > 0;
	}

	message() {
		return 'Здесь можно ввести только число больше нуля';
	}
}