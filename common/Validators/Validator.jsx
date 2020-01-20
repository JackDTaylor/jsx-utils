export default class Validator {
	static Validate(value) {

	}

	get defaultParams() {
		return {};
	}

	validate() {
		throw new Error(`Валидатор ${this.constructor.name} не объявлен`);
	}

	message() {
		return 'Поле заполнено неправильно';
	}
}