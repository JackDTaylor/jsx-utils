import IsNumberValidator from "./IsNumberValidator";

export default class IsIntegerValidator extends IsNumberValidator {
	validate(value) {
		return isFinite(Math.floor(parseInt(value)));
	}
}