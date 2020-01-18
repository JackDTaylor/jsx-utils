import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	import() {
		global.dateFormat = function dateFormat( format, timestamp ) {
			// Format a local time/date
			//
			// +   original by: Carlos R. L. Rodrigues
			// +	  parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
			// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			// +   improved by: MeEtc (http://yass.meetcweb.com)
			// +   improved by: Brad Touesnard
			let nowTimestamp = (new Date()).getTime();
			let a, jsdate = new Date(timestamp ? timestamp * 1000 : nowTimestamp);
			let pad = function(n, c){
				if( (n = n + "").length < c ) {
					return new Array(++c - n.length).join("0") + n;
				} else {
					return n;
				}
			};
			let txt_weekdays = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
			let txt_ordin = {1:"st",2:"nd",3:"rd",21:"st",22:"nd",23:"rd",31:"st"};

			let txt_months           = ["", ...Object.values(Month.Names)];
			let txt_months_gen       = Month.GenitiveNames;
			let txt_months_gen_short = Month.ShortNames;

			let f = {
				// Day
				d: function(){
					return pad(f.j(), 2);
				},
				D: function(){
					return f.l().substr(0,3);
				},
				j: function(){
					return jsdate.getDate();
				},
				l: function(){
					return txt_weekdays[f.w()];
				},
				N: function(){
					return f.w() + 1;
				},
				S: function(){
					return txt_ordin[f.j()] ? txt_ordin[f.j()] : 'th';
				},
				w: function(){
					return jsdate.getDay();
				},
				z: function(){
					return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0;
				},

				// Week
				W: function(){
					let a = f.z(), b = 364 + f.L() - a;
					let nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;

					if(b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b){
						return 1;
					} else{

						if(a <= 2 && nd >= 4 && a >= (6 - nd)){
							nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
							return dateFormat("W", Math.round(nd2.getTime()/1000));
						} else{
							return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
						}
					}
				},

				// Month
				F: function(){
					return txt_months_gen[f.n()];
				},
				M: function(){
					//t = f.F(); return t.substr(0,3);
					return txt_months_gen_short[f.n()];
				},

				f: function(){
					return txt_months[f.n()];
				},
				m: function(){
					return pad(f.n(), 2);
				},
				n: function(){
					return jsdate.getMonth() + 1;
				},
				t: function(){
					let n;
					if( (n = jsdate.getMonth() + 1) == 2 ){
						return 28 + f.L();
					} else{
						if( n & 1 && n < 8 || !(n & 1) && n > 7 ){
							return 31;
						} else{
							return 30;
						}
					}
				},

				// Year
				L: function(){
					let y = f.Y();
					// noinspection JSBitwiseOperatorUsage
					return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0;
				},
				//o not supported yet
				Y: function(){
					return jsdate.getFullYear();
				},
				y: function(){
					return (jsdate.getFullYear() + "").slice(2);
				},

				// Time
				a: function(){
					return jsdate.getHours() > 11 ? "pm" : "am";
				},
				A: function(){
					return f.a().toUpperCase();
				},
				B: function(){
					// peter paul koch:
					let off = (jsdate.getTimezoneOffset() + 60)*60;
					let theSeconds = (jsdate.getHours() * 3600) +
						(jsdate.getMinutes() * 60) +
						jsdate.getSeconds() + off;
					let beat = Math.floor(theSeconds/86.4);
					if (beat > 1000) beat -= 1000;
					if (beat < 0) beat += 1000;
					if ((String(beat)).length == 1) beat = "00"+beat;
					if ((String(beat)).length == 2) beat = "0"+beat;
					return beat;
				},
				g: function(){
					return jsdate.getHours() % 12 || 12;
				},
				G: function(){
					return jsdate.getHours();
				},
				h: function(){
					return pad(f.g(), 2);
				},
				H: function(){
					return pad(jsdate.getHours(), 2);
				},
				i: function(){
					return pad(jsdate.getMinutes(), 2);
				},
				s: function(){
					return pad(jsdate.getSeconds(), 2);
				},
				//u not supported yet

				// Timezone
				//e not supported yet
				//I not supported yet
				O: function(){
					let t = pad(Math.abs(jsdate.getTimezoneOffset()/60*100), 4);
					if (jsdate.getTimezoneOffset() > 0) t = "-" + t; else t = "+" + t;
					return t;
				},
				P: function(){
					let O = f.O();
					return (O.substr(0, 3) + ":" + O.substr(3, 2));
				},
				//T not supported yet
				//Z not supported yet

				// Full Date/Time
				c: function(){
					return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P();
				},
				//r not supported yet
				U: function(){
					return Math.round(jsdate.getTime()/1000);
				}
			};

			return format.replace(/[\\]?([a-zA-Z])/g, function(t, s){
				let ret;

				if( t!=s ){
					// escaped
					ret = s;
				} else if( f[s] ){
					// a date function exists
					ret = f[s]();
				} else{
					// nothing special
					ret = s;
				}

				return ret;
			});
		};

		global.dateParse = function dateParse(text, now) {
			//  discuss at: http://phpjs.org/functions/strtotime/
			//     version: 1109.2016
			// original by: Caio Ariede (http://caioariede.com)
			// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			// improved by: Caio Ariede (http://caioariede.com)
			// improved by: A. Matías Quezada (http://amatiasq.com)
			// improved by: preuter
			// improved by: Brett Zamir (http://brett-zamir.me)
			// improved by: Mirko Faber
			//    input by: David
			// bugfixed by: Wagner B. Soares
			// bugfixed by: Artur Tchernychev
			//        note: Examples all have a fixed timestamp to prevent tests to fail because of variable time(zones)
			//   example 1: strtotime('+1 day', 1129633200);
			//   returns 1: 1129719600
			//   example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200);
			//   returns 2: 1130425202
			//   example 3: strtotime('last month', 1129633200);
			//   returns 3: 1127041200
			//   example 4: strtotime('2009-05-04 08:30:00 GMT');
			//   returns 4: 1241425800

			let parsed, match, today, year, date, days, ranges, len, times, regex, i, fail = false;

			if (!text) {
				return fail;
			}

			// Unecessary spaces
			text = text.replace(/^\s+|\s+$/g, '')
				.replace(/\s{2,}/g, ' ')
				.replace(/[\t\r\n]/g, '')
				.toLowerCase();

			// in contrast to php, js Date.parse function interprets:
			// dates given as yyyy-mm-dd as in timezone: UTC,
			// dates with "." or "-" as MDY instead of DMY
			// dates with two-digit years differently
			// etc...etc...
			// ...therefore we manually parse lots of common date formats
			// noinspection RegExpRedundantEscape
			match = text.match(
				/^(\d{1,4})([\-\.\/\:])(\d{1,2})([\-\.\/\:])(\d{1,4})(?:\s(\d{1,2}):(\d{2})?:?(\d{2})?)?(?:\s([A-Z]+)?)?$/);

			if (match && match[2] === match[4]) {
				if (match[1] > 1901) {
					switch (match[2]) {
						case '-':
						{
							// YYYY-M-D
							if (match[3] > 12 || match[5] > 31) {
								return fail;
							}

							return new Date(match[1], parseInt(match[3], 10) - 1, match[5],
								match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
						}
						case '.':
						{
							// YYYY.M.D is not parsed by strtotime()
							return fail;
						}
						case '/':
						{
							// YYYY/M/D
							if (match[3] > 12 || match[5] > 31) {
								return fail;
							}

							return new Date(match[1], parseInt(match[3], 10) - 1, match[5],
								match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
						}
					}
				} else if (match[5] > 1901) {
					switch (match[2]) {
						case '-':
						{
							// D-M-YYYY
							if (match[3] > 12 || match[1] > 31) {
								return fail;
							}

							return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
								match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
						}
						case '.':
						{
							// D.M.YYYY
							if (match[3] > 12 || match[1] > 31) {
								return fail;
							}

							return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
								match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
						}
						case '/':
						{
							// M/D/YYYY
							if (match[1] > 12 || match[3] > 31) {
								return fail;
							}

							return new Date(match[5], parseInt(match[1], 10) - 1, match[3],
								match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
						}
					}
				} else {
					switch (match[2]) {
						case '-':
						{
							// YY-M-D
							if (match[3] > 12 || match[5] > 31 || (match[1] < 70 && match[1] > 38)) {
								return fail;
							}

							year = match[1] >= 0 && match[1] <= 38 ? +match[1] + 2000 : match[1];
							return new Date(year, parseInt(match[3], 10) - 1, match[5],
								match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
						}
						case '.':
						{
							// D.M.YY or H.MM.SS
							if (match[5] >= 70) {
								// D.M.YY
								if (match[3] > 12 || match[1] > 31) {
									return fail;
								}

								return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
									match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
							}
							if (match[5] < 60 && !match[6]) {
								// H.MM.SS
								if (match[1] > 23 || match[3] > 59) {
									return fail;
								}

								today = new Date();
								return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
									match[1] || 0, match[3] || 0, match[5] || 0, match[9] || 0) / 1000;
							}

							// invalid format, cannot be parsed
							return fail;
						}
						case '/':
						{
							// M/D/YY
							if (match[1] > 12 || match[3] > 31 || (match[5] < 70 && match[5] > 38)) {
								return fail;
							}

							year = match[5] >= 0 && match[5] <= 38 ? +match[5] + 2000 : match[5];
							return new Date(year, parseInt(match[1], 10) - 1, match[3],
								match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
						}
						case ':':
						{
							// HH:MM:SS
							if (match[1] > 23 || match[3] > 59 || match[5] > 59) {
								return fail;
							}

							today = new Date();
							return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
								match[1] || 0, match[3] || 0, match[5] || 0) / 1000;
						}
					}
				}
			}

			// other formats and "now" should be parsed by Date.parse()
			if (text === 'now') {
				return now === null || isNaN(now) ? new Date()
					.getTime() / 1000 | 0 : now | 0;
			}
			if (!isNaN(parsed = Date.parse(text))) {
				return parsed / 1000 | 0;
			}

			date = now ? new Date(now * 1000) : new Date();
			days = {
				'sun': 0,
				'mon': 1,
				'tue': 2,
				'wed': 3,
				'thu': 4,
				'fri': 5,
				'sat': 6
			};
			ranges = {
				'yea': 'FullYear',
				'mon': 'Month',
				'day': 'Date',
				'hou': 'Hours',
				'min': 'Minutes',
				'sec': 'Seconds'
			};

			function lastNext(type, range, modifier) {
				let diff, day = days[range];

				if (typeof(day) == "undefined") {
					diff = day - date.getDay();

					if (diff === 0) {
						diff = 7 * modifier;
					} else if (diff > 0 && type === 'last') {
						diff -= 7;
					} else if (diff < 0 && type === 'next') {
						diff += 7;
					}

					date.setDate(date.getDate() + diff);
				}
			}

			function process(val) {
				let splt = val.split(' '), // Todo: Reconcile this with regex using \s, taking into account browser issues with split and regexes
					type = splt[0],
					range = splt[1].substring(0, 3),
					typeIsNumber = /\d+/.test(type),
					ago = splt[2] === 'ago',
					num = (type === 'last' ? -1 : 1) * (ago ? -1 : 1);

				if (typeIsNumber) {
					num *= parseInt(type, 10);
				}

				if (ranges.hasOwnProperty(range) && !splt[1].match(/^mon(day|\.)?$/i)) {
					return date['set' + ranges[range]](date['get' + ranges[range]]() + num);
				}

				if (range === 'wee') {
					return date.setDate(date.getDate() + (num * 7));
				}

				if (type === 'next' || type === 'last') {
					lastNext(type, range, num);
				} else if (!typeIsNumber) {
					return false;
				}

				return true;
			}

			times = '(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec' +
				'|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?' +
				'|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)';
			regex = '([+-]?\\d+\\s' + times + '|' + '(last|next)\\s' + times + ')(\\sago)?';

			match = text.match(new RegExp(regex, 'gi'));
			if (!match) {
				return fail;
			}

			for (i = 0, len = match.length; i < len; i++) {
				if (!process(match[i])) {
					return fail;
				}
			}

			// ECMAScript 5 only
			// if (!match.every(process))
			//    return false;

			return (date.getTime() / 1000);
		};

		// This weird "sort of inheritance" is needed because babel throws an error when class is
		// used as a function, whereas the Date "class" can be invoked this way: `x = Date(...)`
		// Also it defines it in the way that PHPStorm autocomplete is correctly reads both custom
		// and default methods of Date.
		ClassUtils.applyMixin(global.Date, _Date => @reactified class Date {
			static utcRegex = /^\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z$/;

			constructor(...a) {}

			static filterInRange(columnBasename, date = new _Date()) {
				return {
					[`${columnBasename}_from`]: {
						$anythingOf: true,
						1: { [`${columnBasename}_from`]: { null: true } },
						2: { [`${columnBasename}_from`]: { ltEq: date.sql } }
					},

					[`${columnBasename}_to`]: {
						$anythingOf: true,
						1: { [`${columnBasename}_to`]: { null: true } },
						2: { [`${columnBasename}_to`]: { gtEq: date.sql } }
					},
				};
			}

			static formatRange(min, max, withTime = true, minPrefix = 'с', maxPrefix = 'по') {
				if(!min && !max) {
					return false;
				}

				if(!min) {
					return `${maxPrefix} ${max.format(withTime ? 'j F Y H:i' : 'j F Y')}`;
				}

				if(!max) {
					return `${minPrefix} ${min.format(withTime ? 'j F Y H:i' : 'j F Y')}`;
				}

				if(min > max) {
					[max, min] = [min, max];
				}

				const yearMatch  = min.format('Y') == max.format('Y');
				const monthMatch = yearMatch && min.format('F') == max.format('F');
				const dayMatch   = monthMatch && min.format('j') == max.format('j');

				if(withTime) {
					if(dayMatch) {
						return [
							min.format('j F Y,'),
							minPrefix, min.format('H:i'),
							maxPrefix, max.format('H:i'),
						].exceptEmpty().join(' ');
					}

					return [
						minPrefix, min.format('j F Y, H:i'),
						maxPrefix, max.format('j F Y, H:i'),
					].exceptEmpty().join(' ');
				}

				if(dayMatch) {
					return max.format('j F Y');
				}

				if(monthMatch) {
					return [
						minPrefix,
						min.format('j'),
						maxPrefix,
						max.format('j F Y'),
					].exceptEmpty().join(' ');
				}

				if(yearMatch) {
					return [
						minPrefix,
						min.format('j F'),
						maxPrefix,
						max.format('j F Y'),
					].exceptEmpty().join(' ');
				}


				return [
					minPrefix,
					min.format('j F Y'),
					maxPrefix,
					max.format('j F Y'),
				].exceptEmpty().join(' ');
			}

			static get todayTimestamp() {
				let now = new this();
				now.setHours(0,0,0);

				return now.getTime();
			}

			static get today() {
				return new this(this.todayTimestamp);
			}

			static get current() {
				return new this;
			}

			get timestamp() {
				return this.getTime();
			}

			get unixTimestamp() {
				return Math.floor(this.timestamp / 1000);
			}

			add(interval) {
				return new _Date(this.timestamp + interval);
			}

			subtract(interval) {
				return this.add(-interval);
			}

			clone() {
				return new _Date(this.timestamp);
			}

			get isValid() {
				return (isNaN(this.timestamp) || this.timestamp == 0) == false;
			}

			dayEqual(other) {
				if(!other) {
					return false;
				}

				return this.day.timestamp == other.day.timestamp;
			}

			get dayRange() {
				if('range' in global == false) {
					throw new Error("Module `common.Utils.Range` is not imported");
				}

				return range(this.day, this.nextDay);
			}

			get day() {
				let result = this.clone();
				result.setHours(0,0,0,0);
				return result;
			}

			get dayOfWeek() {
				let result = this.getDay();

				if(result == 0) {
					result = 7;
				}

				return result - 1;
			}

			get isWeekend() {
				return [DayOfWeek.SAT, DayOfWeek.SUN].has(this.dayOfWeek);
			}

			diff(that) {
				return this.getTime() - that.getTime();
			}

			daysDiff(that) {
				const a = _Date.UTC(this.getFullYear(), this.getMonth(), this.getDate());
				const b = _Date.UTC(that.getFullYear(), that.getMonth(), that.getDate());

				return Math.floor((a - b) / DAY);
			}

			get dayIndex() {
				return this.daysDiff(new _Date('2000-01-01'));
			}

			get week() {
				let day = this.day;
				return day.subtract(day.dayOfWeek * Time.DAY);
			}

			get month() {
				let result = this.day;
				result.setDate(1);
				return result;
			}

			get year() {
				let result = this.month;
				result.setMonth(0);
				return result;
			}

			get prevDay() {
				return this.day.subtract(Time.DAY);
			}

			get prevWeek() {
				return this.week.subtract(Time.WEEK);
			}

			get prevMonth() {
				return this.month.subtract(Time.SECOND).month;
			}
			get prevYear() {
				return this.year.subtract(Time.SECOND).year;
			}

			get nextDay() {
				return this.day.add(Time.DAY);
			}

			get nextWeek() {
				return this.week.add(Time.WEEK);
			}

			get nextMonth() {
				let result = this.month;
				result.setMonth(result.getMonth() + 1);
				return result;
			}

			get nextYear() {
				let result = this.year;
				result.setYear(result.getYear() + 1900 + 1);
				return result;
			}

			get sql() {
				return this.format('Y-m-d H:i:s');
			}

			format(format = 'j \F Y в H:i') {
				return dateFormat(format + '', this.unixTimestamp);
			}

			toReact() {
				return this.format();
			}
		});
	}
}