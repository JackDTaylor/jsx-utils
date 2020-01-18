import AbstractCreateElementHook from "./AbstractCreateElementHook";

export default () => new class ContextualHook extends AbstractCreateElementHook {
	condition() {
		return this.element && this.element.IsContexted && !(this.props && this.props.isContexted);
	}

	prepareConsumerProps(baseProps) {
		const props = {};

		if(baseProps && 'key' in baseProps) {
			props.key = baseProps.key;
		}

		return props;
	}

	prepareComponentProps(baseProps, consumedContext) {
		const props = {...baseProps, consumedContext, isContexted: true};

		// noinspection JSUnresolvedVariable
		if(props.nonContextable) {
			props.consumedContext = null;
			delete props.nonContextable;
		}

		if(props.contextualRef) {
			const newRef = props.contextualRef;
			const oldRef = props.ref || (x => x);

			delete props.contextualRef;

			props.ref = function() {
				oldRef.apply(this, arguments);
				newRef.apply(this, arguments);
			};
		}

		return props;
	}

	action() {
		const {element: Component, props, children} = this;
		const Consumer = this.element.ContextConsumer;

		const consumerProps = this.prepareConsumerProps(props);

		const handler = (consumedContext) => {
			const componentProps = this.prepareComponentProps(props, consumedContext);
			const result = React.createElement(Component, componentProps, ...children);

			if(Component.ContextualRender) {
				return Component.ContextualRender(result, consumedContext, {props, children});
			}

			return result;
		};

		return (
			<Consumer {...consumerProps}>{handler}</Consumer>
		);
	}
}