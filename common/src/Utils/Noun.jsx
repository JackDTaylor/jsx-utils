import {NounDeclension, NounPluralization} from "./Morphos/Morphos";
import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	*dependencies() {
		yield "common.Decorators";
	}

	import() {
		/**
		 * @typedef {Object} NounCasesShort
		 * @property {String} nom Именительный
		 * @property {String} gen Родительный
		 * @property {String} dat Дательный
		 * @property {String} acc Винительный
		 * @property {String} abl Творительный
		 * @property {String} pre Предложный
		 */

		/**
		 * @typedef {Object} NounCasesLong
		 * @property {String} nominative    Именительный
		 * @property {String} genitive      Родительный
		 * @property {String} dative        Дательный
		 * @property {String} accusative    Винительный
		 * @property {String} ablative      Творительный
		 * @property {String} prepositional Предложный
		 */

		/**
		 * Noun
		 * @global
		 */
		@reactified
		class Noun {
			/** @type {String} */
			base = '';

			/** @type {NounCasesLong} */
			single = {
				ablative:      '',
				accusative:    '',
				dative:        '',
				genitive:      '',
				nominative:    '',
				prepositional: '',
			};

			/** @type {NounCasesLong} */
			plural = {
				ablative:      '',
				accusative:    '',
				dative:        '',
				genitive:      '',
				nominative:    '',
				prepositional: '',
			};

			constructor(
				nomSingular, nomPlural,
				genSingular, genPlural,
				datSingular, datPlural,
				accSingular, accPlural,
				ablSingular, ablPlural,
				preSingular, prePlural
			) {
				if(arguments.length <= 3) {
					let [words, animateness, exceptions] = arguments;

					this.base = words;

					words = `${words}`.split(' ');
					animateness = !!animateness;
					exceptions = exceptions || {};

					let word = words.first;
					let ending = words.slice(1).join(' ');

					this.single = NounDeclension.getCases(word, animateness);
					this.plural = NounPluralization.getCases(word, animateness);

					if(ending) {
						for(const key of keys(this.single)) {
							this.single[key] += ' ' + ending;
						}

						for(const key of keys(this.plural)) {
							this.plural[key] += ' ' + ending;
						}
					}

					if(exceptions instanceof Function) {
						exceptions(this);
					} else {
						if(exceptions.single) {
							Object.assign(this.single, exceptions.single);
						}

						if(exceptions.plural) {
							Object.assign(this.plural, exceptions.plural);
						}
					}
				} else {
					this.single.nominative    = nomSingular;
					this.single.genitive      = genSingular;
					this.single.dative        = datSingular;
					this.single.accusative    = accSingular;
					this.single.ablative      = ablSingular;
					this.single.prepositional = preSingular;

					this.plural.nominative    = nomPlural;
					this.plural.genitive      = genPlural;
					this.plural.dative        = datPlural;
					this.plural.accusative    = accPlural;
					this.plural.ablative      = ablPlural;
					this.plural.prepositional = prePlural;
				}
			}

			/** @protected */
			get(type) {
				type = type.split(' ');
				type[1] = type[1] == 'plural' ? type[1] : 'single';

				return this[type[1]][type[0]];
			}

			/** @return {NounCasesShort} */
			get sin() {
				return {
					nom: this.single.nominative,
					gen: this.single.genitive,
					dat: this.single.dative,
					acc: this.single.accusative,
					abl: this.single.ablative,
					pre: this.single.prepositional,
				}
			}

			/** @return {NounCasesShort} */
			get plu() {
				return {
					nom: this.plural.nominative,
					gen: this.plural.genitive,
					dat: this.plural.dative,
					acc: this.plural.accusative,
					abl: this.plural.ablative,
					pre: this.plural.prepositional,
				}
			}

			/** Именительный */ get nom() { return this.sin.nom; }
			/** Родительный  */ get gen() { return this.sin.gen; }
			/** Дательный    */ get dat() { return this.sin.dat; }
			/** Винительный  */ get acc() { return this.sin.acc; }
			/** Творительный */ get abl() { return this.sin.abl; }
			/** Предложный   */ get pre() { return this.sin.pre; }

			/** @protected */
			get plain() {
				return `\nsingle: ${Object.values(this.sin).join(',')}\nplural: ${Object.values(this.plu).join(',')}`;
			}

			generateExample() {
				return `
					[ЕДИНСТВЕННОЕ ЧИСЛО]
					${this.sin.nom.ucFirst()}. Нет ${this.sin.gen}.
					${this.sin.abl.ucFirst()} пишутся книги о ${this.sin.pre}.
					Кому это нужно? ${this.sin.dat.ucFirst()}.
					Кого я виню в этом? ${this.sin.acc.ucFirst()}.
					
					[МНОЖЕСТВЕННОЕ ЧИСЛО]
					${this.plu.nom.ucFirst()}. Нет ${this.plu.gen}.
					${this.plu.abl.ucFirst()} пишутся книги о ${this.plu.pre}.
					Кому это нужно? ${this.plu.dat.ucFirst()}.
					Кого я виню в этом? ${this.plu.acc.ucFirst()}.
				`.replace(/\t+/g, '').trim();
			}

			toReact() {
				return this.toString();
			}

			toString() {
				return this.base;
			}
		}

		global.Noun = Noun;
		global.NounDeclension = NounDeclension;
		global.NounPluralization = NounPluralization;

		let array = (...a) => a;
		global.NounPluralization.__test = function() {
			let test = (name, anim, res) => {
				let fact = Object.values(NounPluralization.getCases(name, anim)).join(',');
				return (fact == res.join(',')) == true || `${name}: ${fact}`;
			};

			return [
				test('дом', false, array('дома', 'домов', 'домам', 'дома', 'домами', 'домах')),
				test('склон', false, array('склоны', 'склонов', 'склонам', 'склоны', 'склонами', 'склонах')),
				test('поле', false, array('поля', 'полей', 'полям', 'поля', 'полями', 'полях')),
				test('ночь', false, array('ночи', 'ночей', 'ночам', 'ночи', 'ночами', 'ночах')),
				test('кирпич', false, array('кирпичи', 'кирпичей', 'кирпичам', 'кирпичи', 'кирпичами', 'кирпичах')),
				test('гвоздь', false, array('гвоздя', 'гвоздей', 'гвоздям', 'гвоздя', 'гвоздями', 'гвоздях')),
				test('гений', true, array('гения', 'гениев', 'гениям', 'гениев', 'гениями', 'гениях')),
				test('молния', false, array('молния', 'молний', 'молниям', 'молния', 'молниями', 'молниях')),
				test('тысяча', false, array('тысячи', 'тысяч', 'тысячам', 'тысячи', 'тысячами', 'тысячах')),
				test('сообщение', false, array('сообщения', 'сообщений', 'сообщениям', 'сообщения', 'сообщениями', 'сообщениях')),
				test('халат', false, array('халаты', 'халатов', 'халатам', 'халаты', 'халатами', 'халатах')),
				test('прожектор', false, array('прожекторы', 'прожекторов', 'прожекторам', 'прожекторы', 'прожекторами', 'прожекторах')),
				test('копейка', false, array('копейки', 'копеек', 'копейкам', 'копейки', 'копейками', 'копейках')),
				test('батарейка', false, array('батарейки', 'батареек', 'батарейкам', 'батарейки', 'батарейками', 'батарейках')),
				test('письмо', false, array('письма', 'писем', 'письмам', 'письма', 'письмами', 'письмах')),
				test('песец', true, array('песцы', 'песцов', 'песцам', 'песцов', 'песцами', 'песцах')),
				test('пятно', false, array('пятна', 'пятен', 'пятнам', 'пятна', 'пятнами', 'пятнах')),
				test('волчище', false, array('волчища', 'волчищ', 'волчищам', 'волчища', 'волчищами', 'волчищах')),
				test('год', false, array('года', 'годов', 'годам', 'года', 'годами', 'годах')),
				test('месяц', false, array('месяцы', 'месяцев', 'месяцам', 'месяцы', 'месяцами', 'месяцах')),
				test('новость', false, array('новости', 'новостей', 'новостям', 'новости', 'новостями', 'новостях')),
				test('тень', false, array('тени', 'теней', 'теням', 'тени', 'тенями', 'тенях')),
				test('выходной', false, array('выходные', 'выходных', 'выходным', 'выходные', 'выходными', 'выходных')),
				test('двугривенный', false, array('двугривенные', 'двугривенных', 'двугривенным', 'двугривенные', 'двугривенными', 'двугривенных')),
				test('рабочий', true, array('рабочие', 'рабочих', 'рабочим', 'рабочих', 'рабочими', 'рабочих')),
				test('животное', true, array('животные', 'животных', 'животным', 'животных', 'животными', 'животных')),
				test('подлежащее', false, array('подлежащие', 'подлежащих', 'подлежащим', 'подлежащие', 'подлежащими', 'подлежащих')),
				test('запятая', false, array('запятые', 'запятых', 'запятым', 'запятые', 'запятыми', 'запятых')),
				test('горничная', true, array('горничные', 'горничных', 'горничным', 'горничных', 'горничными', 'горничных')),
				test('заведующая', true, array('заведующие', 'заведующих', 'заведующим', 'заведующих', 'заведующими', 'заведующих')),
				test('корабль', false, array('корабли', 'кораблей', 'кораблям', 'корабли', 'кораблями', 'кораблях')),
			].filter(x => x !== true);
		};
		global.NounDeclension.__test = function() {
			let test = (name, anim, res) => {
				let fact = Object.values(NounDeclension.getCases(name, anim)).join(',');
				return (fact == res.join(',')) == true || `${name}: ${fact}`;
			};
			return [
				test('молния', false, array('молния', 'молнии', 'молние', 'молнию', 'молнией', 'молние')),
				test('папа', true, array('папа', 'папы', 'папе', 'папу', 'папой', 'папе')),
				test('слава', false, array('слава', 'славы', 'славе', 'славу', 'славой', 'славе')),
				test('пустыня', false, array('пустыня', 'пустыни', 'пустыне', 'пустыню', 'пустыней', 'пустыне')),
				test('вилка', false, array('вилка', 'вилки', 'вилке', 'вилку', 'вилкой', 'вилке')),
				test('тысяча', false, array('тысяча', 'тысячи', 'тысяче', 'тысячу', 'тысячей', 'тысяче')),
				test('копейка', false, array('копейка', 'копейки', 'копейке', 'копейку', 'копейкой', 'копейке')),
				test('батарейка', false, array('батарейка', 'батарейки', 'батарейке', 'батарейку', 'батарейкой', 'батарейке')),
				test('гривна', false, array('гривна', 'гривны', 'гривне', 'гривну', 'гривной', 'гривне')),
				test('дом', false, array('дом', 'дома', 'дому', 'дом', 'домом', 'доме')),
				test('поле', false, array('поле', 'поля', 'полю', 'поле', 'полем', 'поле')),
				test('кирпич', false, array('кирпич', 'кирпича', 'кирпичу', 'кирпич', 'кирпичем', 'кирпиче')),
				test('гений', true, array('гений', 'гения', 'гению', 'гения', 'гением', 'гении')),
				test('ястреб', true, array('ястреб', 'ястреба', 'ястребу', 'ястреба', 'ястребом', 'ястребе')),
				test('склон', false, array('склон', 'склона', 'склону', 'склон', 'склоном', 'склоне')),
				test('сообщение', false, array('сообщение', 'сообщения', 'сообщению', 'сообщение', 'сообщением', 'сообщении')),
				test('общение', false, array('общение', 'общения', 'общению', 'общение', 'общением', 'общении')),
				test('воскрешение', false, array('воскрешение', 'воскрешения', 'воскрешению', 'воскрешение', 'воскрешением', 'воскрешении')),
				test('доллар', false, array('доллар', 'доллара', 'доллару', 'доллар', 'долларом', 'долларе')),
				test('евро', false, array('евро', 'евро', 'евро', 'евро', 'евро', 'евро')),
				test('фунт', false, array('фунт', 'фунта', 'фунту', 'фунт', 'фунтом', 'фунте')),
				test('человек', true, array('человек', 'человека', 'человеку', 'человека', 'человеком', 'человеке')),
				test('год', false, array('год', 'года', 'году', 'год', 'годом', 'годе')),
				test('месяц', false, array('месяц', 'месяца', 'месяцу', 'месяц', 'месяцем', 'месяце')),
				test('бремя', false, array('бремя', 'бремени', 'бремени', 'бремя', 'бременем', 'бремени')),
				test('дитя', false, array('дитя', 'дитяти', 'дитяти', 'дитя', 'дитятей', 'дитяти')),
				test('путь', false, array('путь', 'пути', 'пути', 'путь', 'путем', 'пути')), // сущ мужского рода с мягким окончанием
				test('гвоздь', false, array('гвоздь', 'гвоздя', 'гвоздю', 'гвоздь', 'гвоздем', 'гвозде')),
				test('день', false, array('день', 'дня', 'дню', 'день', 'днем', 'дне')),
				test('камень', false, array('камень', 'камня', 'камню', 'камень', 'камнем', 'камне')),
				test('рубль', false, array('рубль', 'рубля', 'рублю', 'рубль', 'рублем', 'рубле')), // увеличительная форма
				test('волчище', true, array('волчище', 'волчища', 'волчищу', 'волчище', 'волчищем', 'волчище')),
				test('полотнище', false, array('полотнище', 'полотнища', 'полотнищу', 'полотнище', 'полотнищем', 'полотнище')), // уменьшительная форма
				test('волчок', false, array('волчок', 'волчка',  'волчку',  'волчок',  'волчком',  'волчке')),
				test('котёнок', true, array('котёнок', 'котёнка',  'котёнку',  'котёнка',  'котёнком',  'котёнке')),
				test('станок', false, array('станок', 'станка',  'станку',  'станок',  'станком',  'станке')), // Адъективное склонение (от прилагательных и причастий)// мужской род
				test('выходной', false, array('выходной', 'выходного', 'выходному', 'выходной', 'выходным', 'выходном')),
				test('двугривенный', false, array('двугривенный', 'двугривенного', 'двугривенному', 'двугривенный', 'двугривенным', 'двугривенном')),
				test('рабочий', false, array('рабочий', 'рабочего', 'рабочему', 'рабочего', 'рабочим', 'рабочем')), // средний род
				test('животное', true, array('животное', 'животного', 'животному', 'животное', 'животным', 'животном')),
				test('подлежащее', false, array('подлежащее', 'подлежащего', 'подлежащему', 'подлежащее', 'подлежащим', 'подлежащем')), // женский род
				test('запятая', false, array('запятая', 'запятой', 'запятой', 'запятую', 'запятой', 'запятой')),
				test('горничная', true, array('горничная', 'горничной', 'горничной', 'горничную', 'горничной', 'горничной')),
				test('заведующая', true, array('заведующая', 'заведующей', 'заведующей', 'заведующую', 'заведующей', 'заведующей')),
				test('ночь', false, array('ночь', 'ночи', 'ночи', 'ночь', 'ночью', 'ночи')),
				test('новость', false, array('новость', 'новости', 'новости', 'новость', 'новостью', 'новости')),
				test('корабль', false, array('корабль', 'корабля', 'кораблю', 'корабль', 'кораблем', 'корабле')),
			].filter(x => x !== true);
		};
		global.Noun.__test = function() {
			return {
				decl: NounDeclension.__test(),
				plur: NounPluralization.__test(),
			}
		};
	}
}