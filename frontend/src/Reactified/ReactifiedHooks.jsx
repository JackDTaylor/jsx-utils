import CreateElementHooks from "./Hooks/ReactHooks";
import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	*dependencies() {
		yield "react";
	}

	import() {
		const createElementHooks = CreateElementHooks();

		React.createElement = (originalCall => function(element, props, ...children) {
			const args = {element, props, children};

			for(const hook of createElementHooks) {
				const result = hook.attach(args).execute();

				if(isUndefined(result) === false) {
					return result;
				}
			}

			return originalCall.apply(this, [args.element, args.props, ...args.children]);
		})(React.createElement);
	}
}