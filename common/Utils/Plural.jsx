export default () => {
	global.Plural = class Plural {
		static word(n, name, animateness) {
			return NounPluralization.pluralize(name, parseFloat(n), animateness);
		}

		static format(n, name, animateness) {
			return n + NBSP + Plural.word(n, name, animateness);
		}
	};
}