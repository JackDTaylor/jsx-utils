import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	import() {
		Function.prototype.toJSON = function() {
			return { $fn: this.toString() };
		};

		Function.prototype.with = function(...Mixins) {
			return Mixins.reduce((T, Mixin) => Mixin(T), this);
		};

		Function.createWithName = function(name, wrappedCall) {
			return new Function(
				'wrappedCall',
				`return function ${name}(){ return wrappedCall.apply(this, arguments); }`
			)(wrappedCall);
		};
	}
}