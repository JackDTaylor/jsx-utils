/**
 * @link https://github.com/wapmorgan/Morphos
 * @licence MIT [https://github.com/wapmorgan/Morphos/blob/master/LICENSE.md]
 * @author Sergey Vanyushin <wapmorgan@gmail.com>
 * @description Morphos library rewritten in ES2016
 *
 * <b>Original description from composer package</b>
 * A morphological solution for Russian and English language written completely
 * in PHP. Provides classes to inflect personal names, geographical names, decline
 * and pluralize nouns, generate cardinal and ordinal numerals, spell out money
 * amounts and time.
 */

class Gender {
	static MALE = 'm';
	static FEMALE = 'f';
	static NEUTER = 'n';
}

class BaseCases extends Gender {
	static NOMINATIVE = 'nominative';
	static GENITIVE = 'genitive';
	static GENETIVE = 'genitive';
	static DATIVE = 'dative';
	static ACCUSATIVE = 'accusative';
	static ABLATIVE = 'ablative';
	static PREPOSITIONAL = 'prepositional';
}

class Cases extends BaseCases {
	static IMENIT_1  = BaseCases.NOMINATIVE;
	static RODIT_2   = BaseCases.GENITIVE;
	static DAT_3     = BaseCases.DATIVE;
	static VINIT_4   = BaseCases.ACCUSATIVE;
	static TVORIT_5  = BaseCases.ABLATIVE;
	static PREDLOJ_6 = BaseCases.PREPOSITIONAL;
	static IMENIT    = BaseCases.NOMINATIVE;
	static RODIT     = BaseCases.GENITIVE;
	static DAT       = BaseCases.DATIVE;
	static VINIT     = BaseCases.ACCUSATIVE;
	static TVORIT    = BaseCases.ABLATIVE;
	static PREDLOJ   = BaseCases.PREPOSITIONAL;
}

class S {
	/**
	 * Sets encoding for using in morphos/* functions.
	 */
	static setEncoding(encoding) {
	}

	/**
	 * Calcules count of characters in string.
	 */
	static strlen(string) {
		return string.length;
	}

	/**
	 * Slices string like python.
	 */
	static slice(string, start, end = null) {
		return string.slice(start, end || undefined);
	}

	/**
	 * Lower case.
	 */
	static lower(string) {
		return string.toLowerCase();
	}
	/**
	 * Upper case.
	 */
	static upper(string) {
		return string.toUpperCase();
	}

	/**
	 * Name case. (ex: Thomas, Lewis)
	 */
	static nameCase(string) {
		return string.ucFirst();
	}

	/**
	 * multiple substr_count().
	 */
	static countChars(string, chars) {
		return string.split(new RegExp(`(${chars.join('|')})`));
	}

	static findLastPositionForOneOfChars(string, chars) {
		let last_position = false;

		for(const char of chars) {
			let pos = string.lastIndexOf(char);

			if(pos >= 0 && pos > last_position) {
				last_position = pos;
			}
		}

		if(last_position !== false) {
			return string.slice(last_position);
		}

		return false;
	}

	static indexOf(string, substring, caseSensetive = false, startOffset = 0)
	{
		if(caseSensetive == false) {
			substring = substring.toLowerCase();
			string = string.toLowerCase();
		}

		return string.indexOf(substring, startOffset);
	}
}

class RussianLanguage extends Cases {
	static MALE = Gender.MALE;
	static FEMALE = Gender.FEMALE;
	static NEUTER = Gender.NEUTER;

	/**
	 * @param caseId
	 * @return string
	 */
	static canonizeCase(caseId) {
		caseId = S.lower(caseId);

		switch (caseId) {
			case Cases.IMENIT:
			case 'именительный':
			case 'именит':
			case 'и':
				return Cases.IMENIT;

			case Cases.RODIT:
			case 'родительный':
			case 'родит':
			case 'р':
				return Cases.RODIT;

			case Cases.DAT:
			case 'дательный':
			case 'дат':
			case 'д':
				return Cases.DAT;

			case Cases.VINIT:
			case 'винительный':
			case 'винит':
			case 'в':
				return Cases.VINIT;

			case Cases.TVORIT:
			case 'творительный':
			case 'творит':
			case 'т':
				return Cases.TVORIT;

			case Cases.PREDLOJ:
			case 'предложный':
			case 'предлож':
			case 'п':
				return Cases.PREDLOJ;

			default:
				return this._canonizeCase(caseId);
		}
	}

	static _canonizeCase(caseId) {
		caseId = S.lower(caseId);

		switch (caseId) {
			case Cases.NOMINATIVE:
			case 'nominativus':
			case 'n':
				return Cases.NOMINATIVE;

			case Cases.GENITIVE:
			case 'genetivus':
			case 'g':
				return Cases.GENITIVE;

			case Cases.DATIVE:
			case 'dativus':
			case 'd':
				return Cases.DATIVE;

			case Cases.ACCUSATIVE:
				return Cases.ACCUSATIVE;

			case Cases.ABLATIVE:
			case 'ablativus':
				return Cases.ABLATIVE;

			case Cases.PREPOSITIONAL:
			case 'praepositionalis':
			case 'p':
				return Cases.PREPOSITIONAL;

			default:
				throw new Error('Invalid case: '+caseId);
		}
	}

	static getAllCases() {
		return [
			Cases.NOMINATIVE,
			Cases.GENITIVE,
			Cases.GENETIVE,
			Cases.DATIVE,
			Cases.ACCUSATIVE,
			Cases.ABLATIVE,
			Cases.PREPOSITIONAL,
		];
	}

	/**
	 * Составляет один массив с падежами из нескольких массивов падежей разных слов
	 * @param words Двумерный массив слов и их падежей
	 * @param delimiter Разделитель между падежами слов
	 * @return Array Одномерный массив падежей
	 */
	static composeCasesFromWords(words, delimiter = ' ') {
		let cases = [];

		for(const caseId of this.getAllCases()) {
			let composedCase = [];

			for(const wordCases of words) {
				composedCase.push(wordCases[caseId]);
			}

			cases[caseId] = composedCase.join(delimiter);
		}

		return cases;
	}


	/**
	 * @var Array Все гласные
	 */
	static vowels = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я'];

	/**
	 * @var Array Все согласные
	 */
	static consonants = ['б', 'в', 'г', 'д', 'ж', 'з', 'й', 'к', 'л', 'м', 'н', 'п', 'р', 'с', 'т', 'ф', 'х', 'ц', 'ч', 'ш', 'щ'];

	/**
	 * @var Object Пары согласных
	 */
	static pairs = {
		'б': 'п',
		'в': 'ф',
		'г': 'к',
		'д': 'т',
		'ж': 'ш',
		'з': 'с',
	};
	/**
	 * @var Array Звонкие согласные
	 */
	static sonorousConsonants = ['б', 'в', 'г', 'д', 'з', 'ж', 'л', 'м', 'н', 'р'];

	/**
	 * @var Array Глухие согласные
	 */
	static deafConsonants = ['п', 'ф', 'к', 'т', 'с', 'ш', 'х', 'ч', 'щ'];

	/**
	 * Проверка гласной
	 */
	static isVowel(char)
	{
		return this.vowels.has(char);
	}
	/**
	 * Проверка согласной
	 */
	static isConsonant(char)
	{
		return this.consonants.has(char);
	}
	/**
	 * Проверка звонкости согласной
	 */
	static isSonorousConsonant(char)
	{
		return this.sonorousConsonants.has(char);
	}
	/**
	 * Проверка глухости согласной
	 */
	static isDeafConsonant(char)
	{
		return this.deafConsonants.has(char);
	}

	/**
	 * Щипящая ли согласная
	 */
	static isHissingConsonant(consonant)
	{
		return ['ж', 'ш', 'ч', 'щ'].has(S.lower(consonant));
	}

	static isVelarConsonant(consonant)
	{
		return ['г', 'к', 'х'].has(S.lower(consonant));
	}

	/**
	 * Подсчет слогов
	 */
	static countSyllables(string)
	{
		return S.countChars(string, this.vowels);
	}
	/**
	 * Проверка парности согласной
	 */
	static isPaired(consonant)
	{
		consonant = S.lower(consonant);

		return consonant in this.pairs || Object.values(this.pairs).has(consonant);
	}

	/**
	 * Проверка мягкости последней согласной
	 */
	static checkLastConsonantSoftness(word)
	{
		let substring = S.findLastPositionForOneOfChars(S.lower(word), this.consonants);

		if(substring !== false) {
			if(['й', 'ч', 'щ'].has(S.slice(substring, 0, 1))) {
				// always soft consonants
				return true;
			} else if(S.strlen(substring) > 1 && ['е', 'ё', 'и', 'ю', 'я', 'ь'].has(S.slice(substring, 1, 2))) {
				// consonants are soft if they are trailed with these vowels
				return true;
			}
		}

		return false;
	}
	/**
	 * Выбор предлога по первой букве
	 */
	static choosePrepositionByFirstLetter(word, prepositionWithVowel, preposition)
	{
		if (['А', 'О', 'И', 'У', 'Э'].has(S.upper(S.slice(word, 0, 1)))) {
			return prepositionWithVowel;
		}

		return preposition;
	}

	/**
	 * Выбор окончания в зависимости от мягкости
	 */
	static chooseVowelAfterConsonant(last, soft_last, after_soft, after_hard)
	{
		if ((this.isHissingConsonant(last) && !['ж', 'ч'].has(last)) || soft_last) {  /* || this.isVelarConsonant(last)*/
			return after_soft;
		} else {
			return after_hard;
		}
	}
	/**
	 * @param verb Verb to modify if gender is female
	 * @param gender If not `m`, verb will be modified
	 * @return string Correct verb
	 */
	static verb(verb, gender)
	{
		verb = S.lower(verb);

		// возвратный глагол
		if (S.slice(verb, -2) == 'ся') {
			return (gender == Gender.MALE ? verb : S.slice(verb, 0, -2)+'ась');
		}

		// обычный глагол
		return (gender == Gender.MALE ? verb : verb+'а');
	}

	/**
	 * Add 'в' or 'во' prepositional before the word
	 * @param word
	 * @return string
	 */
	static inPrepos(word)
	{
		let normalized = S.lower(word).trim();

		if(['в', 'ф'].has(S.slice(normalized, 0, 1))) {
			return 'во '+word;
		}

		return 'в '+word;
	}
	/**
	 * Add 'с' or 'со' prepositional before the word
	 * @param word String
	 * @return String
	 */
	static withPrepos(word)
	{
		let normalized = S.lower(word).trim();

		if(['c', 'з', 'ш', 'ж'].has(S.slice(normalized, 0, 1)) && this.isConsonant(S.slice(normalized, 1, 2)) || S.slice(normalized, 0, 1) == 'щ') {
			return 'со '+word;
		}

		return 'с '+word;
	}
	/**
	 * Add 'о' or 'об' or 'обо' prepositional before the word
	 * @param word
	 * @return string
	 */
	static aboutPrepos(word)
	{
		let normalized = S.lower(word).trim();

		if(this.isVowel(S.slice(normalized, 0, 1)) && !['е', 'ё', 'ю', 'я'].has(S.slice(normalized, 0, 1))) {
			return 'об '+word;
		}

		if(['все', 'всё', 'всю', 'что', 'мне'].has(S.slice(normalized, 0, 3))) {
			return 'обо '+word;
		}

		return 'о '+word;
	}

	/**
	 * Выбирает первое или второе окончание в зависимости от звонкости/глухости в конце слова.
	 * @param word Слово (или префикс), на основе звонкости которого нужно выбрать окончание
	 * @param ifSonorous Окончание, если слово оканчивается на звонкую согласную
	 * @param ifDeaf Окончание, если слово оканчивается на глухую согласную
	 * @return string Первое или второе окончание
	 * @throws Error
	 */
	static chooseEndingBySonority(word, ifSonorous, ifDeaf)
	{
		let last = S.slice(word, -1);

		if(this.isSonorousConsonant(last))
			return ifSonorous;

		if(this.isDeafConsonant(last))
			return ifDeaf;

		throw new Error('Not implemented');
	}

	/**
	 * Проверяет, является ли существительно адъективным существительным
	 * @param noun Существительное
	 * @return Boolean
	 */
	static isAdjectiveNoun(noun) {
		return ['ой', 'ий', 'ый', 'ая', 'ое', 'ее'].has(S.slice(noun, -2)) && noun != 'гений';
	}
}

export class NounDeclension extends RussianLanguage {
	static FIRST_DECLENSION = 1;
	static SECOND_DECLENSION = 2;
	static THIRD_DECLENSION = 3;

	/**
	 * These words has 2 declension type.
	 */
	static abnormalExceptions = {
		'имя':    null,
		'вымя':   null,
		'темя':   null,
		'семя':   null,
		'бремя':  null,
		'пламя':  null,
		'время':  null,
		'знамя':  null,
		'племя':  null,
		'стремя': null,

		'путь':   ['путь', 'пути', 'пути', 'путь', 'путем', 'пути'],
		'дитя':   ['дитя', 'дитяти', 'дитяти', 'дитя', 'дитятей', 'дитяти']
	};

	static masculineWithSoft = [
		'олень',
		'конь',
		'ячмень',
		'путь',
		'зверь',
		'шкворень',
		'пельмень',
		'тюлень',
		'выхухоль',
		'табель',
		'рояль',
		'шампунь',
		'конь',
		'лось',
		'гвоздь',
		'медведь',
		'рубль',
		'дождь',
		'корабль',
		'пользователь',
	];

	static masculineWithSoftAndRunAwayVowels = [
		'день',
		'пень',
		'парень',
		'камень',
		'корень',
		'трутень',
	];

	static immutableWords = [
		'евро',
		'пенни',
	];

	/**
	 * Проверка, изменяемое ли слово.
	 * @param word
	 * @param animateness {Boolean} Признак одушевленности
	 * @return Boolean
	 */
	static isMutable(word, animateness = false) {
		word = S.lower(word);

		const isImmutableEnding = ['у', 'и', 'е', 'о', 'ю'].has(S.slice(word, -1));
		const isImmutableWord = this.immutableWords.has(word);

		return !isImmutableEnding && !isImmutableWord;
	}

	/**
	 * Определение рода существительного.
	 * @param word
	 * @return string
	 */
	static detectGender(word) {
		word = S.lower(word);

		let last = S.slice(word, -1);

		// пытаемся угадать род объекта, хотя бы примерно, чтобы правильно склонять
		if(S.slice(word, -2) == 'мя' || ['о', 'е', 'и', 'у'].has(last)) {
			return this.NEUTER;
		}

		if(['а', 'я'].has(last)) {
			return this.FEMALE;
		}

		if(last == 'ь') {
			if(this.masculineWithSoft.has(word) == false) {
				if(this.masculineWithSoftAndRunAwayVowels.has(word) == false) {
					return this.FEMALE;
				}
			}
		}

		return this.MALE;
	}


	/**
	 * Определение склонения (по школьной программе) существительного.
	 * @param word
	 * @return int
	 */
	static getDeclension(word) {
		word = S.lower(word);

		let last = S.slice(word, -1);

		if(word in this.abnormalExceptions) {
			return 2;
		}

		if(['а', 'я'].has(last) && S.slice(word, -2) != 'мя') {
			return 1;
		} else {
			const isSecond = (
				last == 'ь'
				&& this.isConsonant(S.slice(word, -2, -1))
				&& !this.isHissingConsonant(S.slice(word, -2, -1))
				&& (
					this.masculineWithSoft.has(word)
					|| this.masculineWithSoftAndRunAwayVowels.has(word)
				)// TODO: Check if this is correct!
			);

			if(this.isConsonant(last) || ['о', 'е', 'ё'].has(last) || isSecond) {
				return 2;
			} else {
				return 3;
			}
		}
	}

	/**
	 * Получение слова во всех 6 падежах.
	 * @param word
	 * @param animateness Boolean
	 * @return Object
	 */
	static getCases(word, animateness = false) {
		word = S.lower(word);

		// Адъективное склонение (Сущ, образованные от прилагательных и причастий) - прохожий, существительное
		if(this.isAdjectiveNoun(word)) {
			return this.declinateAdjective(word, animateness);
		}

		// Субстантивное склонение (существительные)
		if(this.immutableWords.has(word)) {
			return {
				[this.IMENIT]:  word,
				[this.RODIT]:   word,
				[this.DAT]:     word,
				[this.VINIT]:   word,
				[this.TVORIT]:  word,
				[this.PREDLOJ]: word,
			};
		} else if(word in this.abnormalExceptions) {
			if(this.abnormalExceptions[word] != null) {
				let i = 0, result = {};

				for(const k of [this.IMENIT, this.RODIT, this.DAT, this.VINIT, this.TVORIT, this.PREDLOJ]) {
					result[k] = this.abnormalExceptions[word][i++];
				}

				return result;
			}

			const prefix = S.slice(word, 0, -1);

			return {
				[this.IMENIT]:  word,
				[this.RODIT]:   prefix + 'ени',
				[this.DAT]:     prefix + 'ени',
				[this.VINIT]:   word,
				[this.TVORIT]:  prefix + 'енем',
				[this.PREDLOJ]: prefix + 'ени',
			};
		}

		switch(this.getDeclension(word)) {
			case this.FIRST_DECLENSION: return this.declinateFirstDeclension(word);
			case this.SECOND_DECLENSION: return this.declinateSecondDeclension(word, animateness);
			case this.THIRD_DECLENSION: return this.declinateThirdDeclension(word);
		}
	}

	/**
	 * Получение всех форм слова первого склонения.
	 * @param word
	 * @return {Object}
	 */
	static declinateFirstDeclension(word) {
		word = S.lower(word);
		let prefix = S.slice(word, 0, -1);
		let last = S.slice(word, -1);
		let soft_last = this.checkLastConsonantSoftness(word);
		let forms =  {
			[Cases.IMENIT]: word,
		};

		// RODIT
		forms[Cases.RODIT] = this.chooseVowelAfterConsonant(
			last,
			soft_last || (['г', 'к', 'х']).has(S.slice(word, -2, -1)),
			prefix+'и',
			prefix+'ы'
		);

		// DAT
		forms[Cases.DAT] = this.getPredCaseOf12Declensions(word, last, prefix);

		// VINIT
		forms[Cases.VINIT] = this.chooseVowelAfterConsonant(
			last,
			soft_last && S.slice(word, -2, -1) != 'ч',
			prefix+'ю',
			prefix+'у'
		);

		// TVORIT
		if (last == 'ь') {
			forms[Cases.TVORIT] = prefix+'ой';
		} else {
			forms[Cases.TVORIT] = this.chooseVowelAfterConsonant(last, soft_last, prefix+'ей', prefix+'ой');
		}

		// 	if ($last == 'й' || (this.isConsonant($last) && !this.isHissingConsonant($last)) || this.checkLastConsonantSoftness($word))
		// 	$forms[Cases.TVORIT] = $prefix.'ей';
		// else
		// 	$forms[Cases.TVORIT] = $prefix.'ой'; # http://morpher.ru/Russian/Spelling.aspx#sibilant
		// PREDLOJ the same as DAT

		forms[Cases.PREDLOJ] = forms[Cases.DAT];

		return forms;
	}

	/**
	 * Получение всех форм слова второго склонения.
	 * @param word
	 * @param animateness Boolean
	 * @return Object
	 */
	static declinateSecondDeclension(word, animateness = false) {
		word = S.lower(word);

		let last = S.slice(word, -1);
		let soft_last = last == 'й' || (['ь', 'е', 'ё', 'ю', 'я'].has(last) && ((this.isConsonant(S.slice(word, -2, -1)) && !this.isHissingConsonant(S.slice(word, -2, -1))) || S.slice(word, -2, -1) == 'и'));
		let prefix = this.getPrefixOfSecondDeclension(word, last);
		let forms =  {[Cases.IMENIT]: word};

		// RODIT
		forms[Cases.RODIT] = this.chooseVowelAfterConsonant(last, soft_last, prefix+'я', prefix+'а');
		// DAT
		forms[Cases.DAT] = this.chooseVowelAfterConsonant(last, soft_last, prefix+'ю', prefix+'у');

		// VINIT
		if (['о', 'е', 'ё'].has(last)) {
			forms[Cases.VINIT] = word;
		} else {
			forms[Cases.VINIT] = this.getVinitCaseByAnimateness(forms, animateness);
		}

		// TVORIT
		// if ($last == 'ь')
		// 	$forms[Cases.TVORIT] = $prefix.'ом';
		// else if ($last == 'й' || (this.isConsonant($last) && !this.isHissingConsonant($last)))
		// 	$forms[Cases.TVORIT] = $prefix.'ем';
		// else
		// 	$forms[Cases.TVORIT] = $prefix.'ом'; # http://morpher.ru/Russian/Spelling.aspx#sibilant

		if (this.isHissingConsonant(last) || (['ь', 'е', 'ё', 'ю', 'я'].has(last) && this.isHissingConsonant(S.slice(word, -2, -1))) || last == 'ц') {
			forms[Cases.TVORIT] = prefix+'ем';
		} else if (['й'/*, 'ч', 'щ'*/].has(last) || soft_last) {
			forms[Cases.TVORIT] = prefix+'ем';
		} else {
			forms[Cases.TVORIT] = prefix+'ом';
		}

		// PREDLOJ
		forms[Cases.PREDLOJ] = this.getPredCaseOf12Declensions(word, last, prefix);

		return forms;
	}

	/**
	 * Получение всех форм слова третьего склонения.
	 * @param word
	 * @return Object
	 */
	static declinateThirdDeclension(word) {
		word = S.lower(word);
		let prefix = S.slice(word, 0, -1);

		return {
			[Cases.IMENIT]:  word,
			[Cases.RODIT]:   prefix+'и',
			[Cases.DAT]:     prefix+'и',
			[Cases.VINIT]:   word,
			[Cases.TVORIT]:  prefix+'ью',
			[Cases.PREDLOJ]: prefix+'и',
		};
	}

	/**
	 * Склонение существительных, образованных от прилагательных и причастий.
	 * Rules are from http://rusgram.narod.ru/1216-1231.html
	 * @param word
	 * @param animateness
	 * @return Object
	 */
	static declinateAdjective(word, animateness) {
		let prefix = S.slice(word, 0, -2);

		switch (S.slice(word, -2)) {
			// Male adjectives
			case 'ой':
			case 'ый':
				return {
					[Cases.IMENIT]:  word,
					[Cases.RODIT]:   prefix+'ого',
					[Cases.DAT]:     prefix+'ому',
					[Cases.VINIT]:   word,
					[Cases.TVORIT]:  prefix+'ым',
					[Cases.PREDLOJ]: prefix+'ом',
				};

			case 'ий':
				return {
					[Cases.IMENIT]:  word,
					[Cases.RODIT]:   prefix+'его',
					[Cases.DAT]:     prefix+'ему',
					[Cases.VINIT]:   prefix+'его',
					[Cases.TVORIT]:  prefix+'им',
					[Cases.PREDLOJ]: prefix+'ем',
				};

			// Neuter adjectives
			case 'ое':
			case 'ее':
				prefix = S.slice(word, 0, -1);

				return {
					[Cases.IMENIT]:  word,
					[Cases.RODIT]:   prefix+'го',
					[Cases.DAT]:     prefix+'му',
					[Cases.VINIT]:   word,
					[Cases.TVORIT]:  S.slice(word, 0, -2)+(S.slice(word, -2, -1) == 'о' ? 'ы' : 'и')+'м',
					[Cases.PREDLOJ]: prefix+'м',
				};

			// Female adjectives
			case 'ая':
				let ending = this.isHissingConsonant(S.slice(prefix, -1)) ? 'ей' : 'ой';

				return {
					[Cases.IMENIT]:  word,
					[Cases.RODIT]:   prefix+ending,
					[Cases.DAT]:     prefix+ending,
					[Cases.VINIT]:   prefix+'ую',
					[Cases.TVORIT]:  prefix+ending,
					[Cases.PREDLOJ]: prefix+ending,
				};
		}
	}
	/**
	 * Получение одной формы слова (падежа).
	 * @param word String Слово
	 * @param caseId Number Падеж
	 * @param animateness Boolean Признак одушевленности
	 * @return String
	 */
	static getCase(word, caseId, animateness = false) {
		caseId = this.canonizeCase(caseId);

		let forms = this.getCases(word, animateness);

		return forms[caseId];
	}
	/**
	 * @param word
	 * @param last
	 * @return bool|string
	 */
	static getPrefixOfSecondDeclension(word, last) {
		let prefix;

		// слова с бегающей гласной в корне
		if(this.masculineWithSoftAndRunAwayVowels.has(word)) {
			prefix = S.slice(word, 0, -3) + S.slice(word, -2, -1);
		} else if(['о', 'е', 'ё', 'ь', 'й'].has(last)) {
			prefix = S.slice(word, 0, -1);
		} else if(S.slice(word, -2) == 'ок' && S.strlen(word) > 3) {
			// уменьшительные формы слов (котенок) и слова с суффиксом ок
			prefix = S.slice(word, 0, -2) + 'к';
		} else {
			prefix = word;
		}

		return prefix;
	}

	/**
	 * @param forms Object
	 * @param animate
	 * @return mixed
	 */
	static getVinitCaseByAnimateness(forms, animate) {
		if(animate) {
			return forms[Cases.RODIT];
		}

		return forms[Cases.IMENIT];
	}

	/**
	 * @param word
	 * @param last
	 * @param prefix
	 * @return string
	 */
	static getPredCaseOf12Declensions(word, last, prefix) {
		if(['ий', 'ие'].has(S.slice(word, -2))) {
			if(last == 'ё') {
				return prefix+'е';
			}

			return prefix+'и';
		}

		return prefix+'е';
	}
}

export class NounPluralization extends RussianLanguage {
		static ONE = 1;
		static TWO_FOUR = 2;
		static FIVE_OTHER = 3;

		static neuterExceptions = [
			'поле',
			'море',
		];

		static genitiveExceptions = {
			'письмо': 'писем',
			'пятно': 'пятен',
			'кресло': 'кресел',
			'коромысло': 'коромысел',
			'ядро': 'ядер',
			'блюдце': 'блюдец',
			'полотенце': 'полотенец',
		};

		static immutableWords = [
			'евро',
			'пенни',
		];

		static runawayVowelsExceptions = [
			'писе*ц',
			'песе*ц',
			'глото*к',
		];

		static runawayVowelsNormalized = false;

		static getRunAwayVowelsList() {
			if(this.runawayVowelsNormalized === false) {
				this.runawayVowelsNormalized = [];

				for(const word of this.runawayVowelsExceptions) {
					this.runawayVowelsNormalized[word.replace('*', '')] = S.indexOf(word, '*') - 1;
				}
			}
			return this.runawayVowelsNormalized;
		}

		/**
		 * Склонение существительного для сочетания с числом (кол-вом предметов).
		 * @param count Количество предметов
		 * @param word Название предмета
		 * @param animateness Признак одушевленности
		 * @return
		 */
		static pluralize(word, count = 2, animateness = false) {
			// меняем местами аргументы, если они переданы в старом формате
			if(typeof count == 'string' && typeof word == 'number') {
				[count, word] = [word, count];
			}

			// для адъективных существительных правила склонения проще:
			// только две формы
			if(this.isAdjectiveNoun(word)) {
				if(this.getNumeralForm(count) == this.ONE) {
					return word;
				} else {
					return this.getCase(word, this.RODIT, animateness);
				}
			}

			switch(this.getNumeralForm(count)) {
				case this.ONE:
					return word;
				case this.TWO_FOUR:
					return NounDeclension.getCase(word, this.RODIT, animateness);
				case this.FIVE_OTHER:
					return this.getCase(word, this.RODIT, animateness);
			}
		}

		/**
		 * @param count
		 * @return
		 */
		static getNumeralForm(count) {
			if(count != Math.round(count)) {
				if(count < 5) {
					return this.TWO_FOUR;
				}

				count = Math.round(count);
			}

			if(count > 100) {
				count %= 100;
			}

			let ending = count % 10;

			if((count > 20 && ending == 1) || count == 1) {
				return this.ONE;
			} else if((count > 20 && [2,3,4].has(ending)) || [2,3,4].has(count)) {
				return this.TWO_FOUR;
			} else {
				return this.FIVE_OTHER;
			}
		}

		/**
		 * @param word
		 * @param caseId
		 * @param animateness
		 * @return
		 */
		static getCase(word, caseId, animateness = false) {
			caseId = this.canonizeCase(caseId);
			let forms = this.getCases(word, animateness);
			return forms[caseId];
		}

		/**
		 * @param word
		 * @param animateness
		 * @return
		 */
		static getCases(word, animateness = false) {
			word = S.lower(word);

			if(this.immutableWords.has(word)) {
				return {
					[this.IMENIT]:  word,
					[this.RODIT]:   word,
					[this.DAT]:     word,
					[this.VINIT]:   word,
					[this.TVORIT]:  word,
					[this.PREDLOJ]: word,
				};
			}

			// Адъективное склонение (Сущ, образованные от прилагательных и причастий) - прохожий, существительное
			if(this.isAdjectiveNoun(word)) {
				return this.declinateAdjective(word, animateness);
			}

			// Субстантивное склонение (существительные)
			return this.declinateSubstative(word, animateness);
		}

		/**
		 * Склонение обычных существительных.
		 * @param word
		 * @param animateness
		 * @return
		 */
		static declinateSubstative(word, animateness) {
			let prefix = S.slice(word, 0, -1);
			let last = S.slice(word, -1);
			let runawayVowelsList = this.getRunAwayVowelsList();

			if(word in runawayVowelsList) {
				let vowelOffset = runawayVowelsList[word];

				word = S.slice(word, 0, vowelOffset) + S.slice(word, vowelOffset + 1);
			}

			let declension = NounDeclension.getDeclension(word);
			let soft_last;

			if(declension == NounDeclension.SECOND_DECLENSION) {
				soft_last = last == 'й' || (['ь', 'е', 'ё', 'ю', 'я'].has(last) && ((this.isConsonant(S.slice(word, -2, -1)) && !this.isHissingConsonant(S.slice(word, -2, -1))) || S.slice(word, -2, -1) == 'и'));
				prefix = NounDeclension.getPrefixOfSecondDeclension(word, last);
			} else if(declension == NounDeclension.FIRST_DECLENSION) {
				soft_last = this.checkLastConsonantSoftness(word);
			} else {
				soft_last = ['чь', 'сь', 'ть', 'нь'].has(S.slice(word, -2));
			}

			let forms = {};

			if(last == 'ч' || ['чь', 'сь', 'ть', 'нь', 'ль'].has(S.slice(word, -2)) || (this.isVowel(last) && ['ч', 'к'].has(S.slice(word, -2, -1)))) { // before ч, чь, сь, ч+vowel, к+vowel
				forms[Cases.IMENIT] = prefix + 'и';
			} else if(['н', 'ц', 'р', 'т'].has(last)) {
				forms[Cases.IMENIT] = prefix + 'ы';
			} else {
				forms[Cases.IMENIT] = this.chooseVowelAfterConsonant(last, soft_last, prefix + 'я', prefix + 'а');
			}

			// RODIT
			if(word in this.genitiveExceptions) {
				forms[Cases.RODIT] = this.genitiveExceptions[word];
			} else if(['о', 'е'].has(last)) {
				// exceptions
				if(this.neuterExceptions.has(word)) {
					forms[Cases.RODIT] = prefix + 'ей';
				} else if(S.slice(word, -2, -1) == 'и') {
					forms[Cases.RODIT] = prefix + 'й';
				} else {
					forms[Cases.RODIT] = prefix;
				}
			} else if(S.slice(word, -2) == 'ка') { // words ending with -ка: чашка, вилка, ложка, тарелка, копейка, батарейка
				if(S.slice(word, -3, -2) == 'л') {
					forms[Cases.RODIT] = S.slice(word, 0, -2) + 'ок';
				} else if(S.slice(word, -3, -2) == 'й') {
					forms[Cases.RODIT] = S.slice(word, 0, -3) + 'ек';
				} else {
					forms[Cases.RODIT] = S.slice(word, 0, -2) + 'ек';
				}
			} else if(['а'].has(last)) { // обида, ябеда
				forms[Cases.RODIT] = prefix;
			} else if(['я'].has(last)) { // молния
				forms[Cases.RODIT] = prefix+'й';
			} else if(this.isHissingConsonant(last) || (soft_last && last != 'й') || ['чь', 'сь', 'ть', 'нь'].has(S.slice(word, -2))) {
				forms[Cases.RODIT] = prefix+'ей';
			} else if(last == 'й' || S.slice(word, -2) == 'яц') { // месяц
				forms[Cases.RODIT] = prefix+'ев';
			} else { // (self::isConsonant($last) && !RussianLanguage::isHissingConsonant($last))
				forms[Cases.RODIT] = prefix+'ов';
			}

			// DAT
			forms[Cases.DAT] = this.chooseVowelAfterConsonant(
				last,
				soft_last && S.slice(word, -2, -1) != 'ч',
				prefix+'ям',
				prefix+ 'ам'
			);

			// VINIT
			forms[Cases.VINIT] = NounDeclension.getVinitCaseByAnimateness(forms, animateness);
			// TVORIT
			// my personal rule
			if(last == 'ь' && declension == NounDeclension.THIRD_DECLENSION && !['чь', 'сь', 'ть', 'нь'].has(S.slice(word, -2))) {
				forms[Cases.TVORIT] = prefix + 'ми';
			} else {
				forms[Cases.TVORIT] = this.chooseVowelAfterConsonant(
					last,
					soft_last && S.slice(word, -2, -1) != 'ч',
					prefix + 'ями',
					prefix + 'ами'
				);
			}

			// PREDLOJ
			forms[Cases.PREDLOJ] = this.chooseVowelAfterConsonant(
				last,
				soft_last && S.slice(word, -2, -1) != 'ч',
				prefix + 'ях',
				prefix + 'ах'
			);

			return forms;
		}

		/**
		 * Склонение существительных, образованных от прилагательных и причастий.
		 * Rules are from http://rusgram.narod.ru/1216-1231.html
		 * @param word
		 * @param animateness
		 * @return
		 */
		static declinateAdjective(word, animateness) {
			let prefix = S.slice(word, 0, -2);
			let vowel = this.isHissingConsonant(S.slice(prefix, -1)) ? 'и' : 'ы';

			return {
				[Cases.IMENIT]: prefix + vowel + 'е',
				[Cases.RODIT]: prefix + vowel + 'х',
				[Cases.DAT]: prefix + vowel + 'м',
				[Cases.VINIT]: prefix + vowel + (animateness ? 'х' : 'е'),
				[Cases.TVORIT]: prefix + vowel + 'ми',
				[Cases.PREDLOJ]: prefix + vowel + 'х',
			};
		}
	}