export default () => {
	// Override Object.prototype.toString() with custom React behavior
	Object.prototype.toString = (originalCall => function() {
		if(React.isValidElement(this)) {
			if(this.type && this.type.ToString) {
				return this.type.ToString(this.props);
			}

			return '[object React]';
		}

		return originalCall.apply(this, arguments)
	})(Object.prototype.toString);
}