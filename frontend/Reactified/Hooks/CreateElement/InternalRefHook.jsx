import AbstractCreateElementHook from "./AbstractCreateElementHook";

export default () => new class InternalRefHook extends AbstractCreateElementHook {
	condition() {
		return this.props && this.props._internalRef;
	}

	action() {
		if(this.props.ref) {
			let originalRef = this.props.ref;
			let internalRef = this.props._internalRef;

			if(valueType(originalRef) == Object) {
				const refObject = originalRef;
				originalRef = e => refObject.current = e;
			}

			if(valueType(internalRef) == Object) {
				const refObject = internalRef;
				internalRef = e => refObject.current = e;
			}

			this.props.ref = function() {
				internalRef.apply(this, arguments);
				originalRef.apply(this, arguments);
			}
		} else {
			this.props.ref = this.props._internalRef;
		}

		delete this.props._internalRef;
	}
}