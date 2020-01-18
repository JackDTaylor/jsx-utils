import Validator from "./Validator";

export default class IsPhoneValidator extends Validator {
	validate(value) {
		let cleanPhone = `${value}`.replace(/[^\d]/g, '');

		// Commented out because most of the time we will validate
		// a masked value with built-in "+7":
		//
		// if(cleanPhone.length == 10) {
		//   cleanPhone = `7${cleanPhone}`;
		// }

		return cleanPhone && cleanPhone.length == 11;
	}

	message() {
		return `Номер телефона должен быть указан в формате${NBSP}+7${NBSP}(999)${NBSP}999${NBSP}99${NBSP}99`;
	}
}
