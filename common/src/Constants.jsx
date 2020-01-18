import JsxUtilsModule from "../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	*dependencies() {
		console.log("dependencies", this.utils.moduleMap);
		if(this.utils.isModuleRegistered("react")) {
			yield "react";
		}
	}

	import() {
		// Fix IDE's `someprop` in not defined in `global`
		if(0) global.global = {};

		global.keys = Object.keys;

		console.log("Including react");
		global.React = global.React || this.dependency("react");

		global.compare = function(a, b) {
			if(a == b) {
				return 0;
			}

			return (a > b) ? 1 : -1;
		};
		global.compareProp = function(fn) {
			if(valueType(fn) == String) {
				fn = (k => x => x[k])(fn);
			}

			return (a,b) => compare(fn(a), fn(b));
		};

		global.REQUIRED_LABEL = 'Это поле обязательно для заполнения';

		global.NBSP = String.fromCharCode(160);
		global.NDASH = String.fromCharCode(8211);
		global.RUBLE = String.fromCharCode(8381);

		// Not in decorators.jsx because constants are included before everything
		global.markedAs = function(mark, container = false) {
			return function(proto, field, descriptor) {
				if(container === false) {
					container = proto;

					mark = 'markedAs$' + mark;
				}

				container[mark] = container[mark] || [];
				container[mark].push(field);

				return descriptor;
			}
		};

		global.nonEnumerable = function(proto, field, descriptor) {
			descriptor.enumerable = false;
			return descriptor;
		};
		global.enumerable = function(proto, field, descriptor) {
			descriptor.enumerable = true;
			return descriptor;
		};

		global.Enum = class {
			@nonEnumerable static Names;

			@nonEnumerable static name(name) {
				return function(proto, field, descriptor) {
					proto.Names = proto.Names || {};
					proto.Names[field] = name;

					return descriptor;
				}
			}

			@nonEnumerable static Key(value) {
				return Object.entries(this).filter(([,x]) => value == x).map(([key]) => key).first;
			}

			@nonEnumerable static Name(value) {
				const key = this.Key(value);

				if(key && key in this.Names) {
					return this.Names[key];
				}

				return key || '__UNKNOWN__';
			}

			@nonEnumerable static get Keys() {
				return Object.keys(this);
			}

			@nonEnumerable static get Values() {
				return Object.values(this);
			}
		};

		global.MICROSECOND = 1;
		global.SECOND      = 1000 * MICROSECOND;
		global.MINUTE      = 60   * SECOND;
		global.HOUR        = 60   * MINUTE;
		global.DAY         = 24   * HOUR;
		global.WEEK        = 7    * DAY;
		global.YEAR        = 365  * DAY;

		global.Time = class Time extends Enum {
			static MICROSECOND = MICROSECOND;
			static SECOND      = SECOND;
			static MINUTE      = MINUTE;
			static HOUR        = HOUR;
			static DAY         = DAY;
			static WEEK        = WEEK;
			static YEAR        = YEAR;

			static deltaTime = 33;
		};

		global.MAX_ANIMATION_TIME = 5 * Time.SECOND;

		global.TimeSecond = class TimeSecond extends Enum {
			static MICROSECOND = MICROSECOND / SECOND;
			static SECOND      = SECOND      / SECOND;
			static MINUTE      = MINUTE      / SECOND;
			static HOUR        = HOUR        / SECOND;
			static DAY         = DAY         / SECOND;
			static WEEK        = WEEK        / SECOND;
			static YEAR        = YEAR        / SECOND;
		};

		global.DayOfWeek = class DayOfWeek extends Enum {
			@Enum.name('Понедельник') static MON = 0;
			@Enum.name('Вторник')     static TUE = 1;
			@Enum.name('Среда')       static WED = 2;
			@Enum.name('Четверг')     static THU = 3;
			@Enum.name('Пятница')     static FRI = 4;
			@Enum.name('Суббота')     static SAT = 5;
			@Enum.name('Воскресенье') static SUN = 6;

			static Names = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
			static ShortNames = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];

			static ShortName(id) {
				return this.ShortNames[id];
			}
		};

		global.Quarter = class Quarter extends Enum {
			@Enum.name('Ⅰ квартал') static Q1 = 1;
			@Enum.name('Ⅱ квартал') static Q2 = 2;
			@Enum.name('Ⅲ квартал') static Q3 = 3;
			@Enum.name('Ⅳ квартал') static Q4 = 4;
		};

		global.Month = class Month extends Enum {
			@Enum.name('Январь')   static JAN = 1;
			@Enum.name('Февраль')  static FEB = 2;
			@Enum.name('Март')     static MAR = 3;
			@Enum.name('Апрель')   static APR = 4;
			@Enum.name('Май')      static MAY = 5;
			@Enum.name('Июнь')     static JUN = 6;
			@Enum.name('Июль')     static JUL = 7;
			@Enum.name('Август')   static AUG = 8;
			@Enum.name('Сентябрь') static SEP = 9;
			@Enum.name('Октябрь')  static OCT = 10;
			@Enum.name('Ноябрь')   static NOV = 11;
			@Enum.name('Декабрь')  static DEC = 12;

			@nonEnumerable
			static GenitiveNames = ["", "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

			@nonEnumerable
			static ShortNames = ["", "янв", "фев", "мар", "апр", "мая", "июня", "июля", "авг", "сен", "окт", "ноя", "дек"];
		};

		const KB          = 1024;
		const MB          = 1024 * KB;
		const GB          = 1024 * MB;

		global.FileSize = class FileSize extends Enum {
			static KB = KB;
			static MB = MB;
			static GB = GB;
		};

		global.RequestType = class RequestType extends Enum {
			static POST   = 'POST';
			static GET    = 'GET';
			static PUT    = 'PUT';
			static DELETE = 'DELETE';
		};
	}
}