import JsxUtilsModule from "./JsxUtilsModule";

export default class ExternalDependencyModule extends JsxUtilsModule {
	constructor(key, object, utils) {
		super(key, utils);

		this.object = object;
	}

	import() {
		return this.object;
	}
}