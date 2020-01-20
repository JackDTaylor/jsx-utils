import Validator from "./Validator";

export default class PasswordValidator extends Validator {
	validate(value) {
		const errors = [];

		if(/^\s/.test(value)) {
			errors.push('Пароль не должен начинаться c пробела');
		}

		if(/\s$/.test(value)) {
			errors.push('Пароль не должен заканчиваться пробелом');
		}

		if(/[А-ЯЁа-яё]/.test(value)) {
			errors.push('Пароль не должен содержать русских букв');
		}

		if(errors.length) {
			throw new ValidationError(errors);
		}

		return true;
	}

	message() {
		return 'Пароль не должен начинаться или заканчиваться пробелом, в нем не должно быть русских букв';
	}
}