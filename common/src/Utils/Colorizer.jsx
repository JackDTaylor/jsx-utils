import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	import() {
		global.Colorizer = class Colorizer {
			static Colors = [
				'#3366cc', '#dc3912', '#ff9900', '#109618',
				'#990099', '#0099c6', '#dd4477', '#3b3eac',
				'#66aa00', '#b82e2e', '#316395', '#994499',
				'#22aa99', '#aaaa11', '#6633cc', '#e67300',
				'#8b0707', '#329262', '#5574a6', '#FF8042',
				'#0088FE', '#00C49F', '#3b3eac', '#FFBB28'
			];

			static Get(index) {
				return this.Colors[ index % this.Colors.length ];
			}
		};

		Colorizer.Dim = class extends Colorizer {
			// noinspection JSMismatchedCollectionQueryUpdate
			static Colors = [
				'#39b6bf', '#b2aa36', '#802662', '#266e80',
				'#7f7a26', '#3668b3', '#39bf81', '#3689b3',
				'#b27836', '#622680', '#26807a', '#7f6226',
				'#b23646', '#36b39a', '#992e92', '#262680',
				'#268056', '#7f4a26', '#b23668', '#46b336',
				'#994a2e', '#263e80', '#268026', '#7f2626',
				'#6f39bf', '#3646b3', '#89b336', '#7f263e',
				'#265680', '#628026',
			];
		};
	}
}