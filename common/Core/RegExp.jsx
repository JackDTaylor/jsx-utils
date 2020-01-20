export default () => {
	RegExp.quote = function(string) {
		// noinspection RegExpRedundantEscape
		return (string+'').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&');
	};

	RegExp.pathStart = function(pathStart) {
		return new RegExp('^' + RegExp.quote(pathStart));
	};

	RegExp.prototype.execAll = function(...args) {
		let p, result = [];

		// noinspection JSAssignmentUsedAsCondition,JSCheckFunctionSignatures
		while(p = this.exec(...args) || result.length > 65535) {
			for(const key of keys(p)) {
				if(key in result == false) {
					result[key] = [];
				}

				result[key].push(p[key]);
			}
		}

		return result;
	};
}