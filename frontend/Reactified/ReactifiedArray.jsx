export default () => {
	const DefaultLink = ({target, children}) => <a onClick={target}>{children}</a>;

	global.Reactified = global.Reactified || {};

	const Link = Reactified.Link || DefaultLink;

	class ArrayReactRenderer extends React.Component {
		@prop limit = 2;
		@prop array;

		@prop allowExpand = false;
		@prop expandStep = 10;
		@prop expandToList = false;

		@state expanded = 0;

		separator(left) {
			if(left > 0) {
				return (left > 1) ? ', ' : ' и ';
			}

			return '';
		}

		get displayAsList() {
			return this.expandToList && this.expanded > 0;
		}

		renderExpandButton(overflow) {
			if(!overflow) {
				return '';
			}

			let text = this.displayAsList ? 'и ' : '';
			text += `еще ${overflow}`;

			if(this.allowExpand) {
				text = <Link dotted target={() => this.expanded += this.expandStep}>{text}</Link>;
			}

			if(!this.displayAsList) {
				return text;
			}

			return <div>{text}</div>;
		}

		render() {
			const array = this.array.slice(0, this.limit + this.expanded);
			const overflow = this.array.length - array.length;

			return (
				<React.Fragment>
					{array.map((item, i) => this.displayAsList ? (
						<div className={`${ReactComponentPrefix}-array-item`} key={i}>{item}</div>
					) : (
						<React.Fragment key={i}>
							{item}
							{this.separator(array.length - i - !overflow)}
						</React.Fragment>
					))}

					{this.renderExpandButton(overflow)}
				</React.Fragment>
			);
		}
	}

	Object.defineProperty(Array.prototype, 'toReact', {
		enumerable: false,
		value(limit = 2) {
			return <ArrayReactRenderer array={this} allowExpand expandToList limit={limit} />;
		}
	});
}