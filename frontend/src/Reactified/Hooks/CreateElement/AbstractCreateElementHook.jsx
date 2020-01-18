export default class AbstractCreateElementHook {
	get element() {
		return this.target.element;
	};

	set element(value) {
		this.target.element = value;
	};

	get props() {
		return this.target.props;
	};

	set props(value) {
		this.target.props = value;
	};

	get children() {
		return this.target.children;
	};

	set children(value) {
		this.target.children = value;
	};

	attach(target) {
		this.target = target;
		return this;
	}

	condition() {
		return false;
	}

	action() {

	}

	execute() {
		if(this.condition()) {
			return this.action();
		}
	}
}