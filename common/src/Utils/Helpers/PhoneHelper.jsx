import JsxUtilsModule from "../../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	import() {
		global.PhoneHelper = class PhoneHelper {
			static ERROR_MSG_EMPTY = "Номер телефона не указан";
			static ERROR_MSG_INCORRECT = "Некорректный формат номера телефона";

			static Clean(rawPhone) {
				if(!rawPhone) {
					throw new Error(PhoneHelper.ERROR_MSG_EMPTY);
				}

				let phone = '+' + `${rawPhone}`.replace(/[^\d]/g, '');
				let phoneRegex = /^(\+\d)(\d{3})(\d{3})(\d{2})(\d{2})$/;

				if(phoneRegex.test(phone) == false) {
					throw new Error(PhoneHelper.ERROR_MSG_INCORRECT);
				}

				return phone.replace(phoneRegex, "$1 ($2) $3 $4 $5");
			}
		};
	}
}