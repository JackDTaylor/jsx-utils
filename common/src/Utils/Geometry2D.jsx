import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	import() {
		/** @deprecated */
		global.Geometry2D = class Geometry2D {
			static Point = class Point {
				x;
				y;

				constructor(x, y) {
					this.x = x;
					this.y = y;
				}
			};

			/**
			 * Graham's Scan Convex Hull Algorithm
			 * @desc An implementation of the Graham's Scan Convex Hull algorithm in JavaScript.
			 * @author Brian Barnett, brian@3kb.co.uk, http://brianbar.net/ || http://3kb.co.uk/
			 * @version 1.0.5
			 */
			static ConvexHullGrahamScan = class ConvexHullGrahamScan {
				anchorPoint;
				reverse = false;
				points = [];

				_findPolarAngle(a, b) {
					const ONE_RADIAN = 57.295779513082;
					let deltaX, deltaY;

					//if the points are undefined, return a zero difference angle.
					if (!a || !b) return 0;

					deltaX = (b.x - a.x);
					deltaY = (b.y - a.y);

					if (deltaX == 0 && deltaY == 0) {
						return 0;
					}

					let angle = Math.atan2(deltaY, deltaX) * ONE_RADIAN;

					if (this.reverse){
						if (angle <= 0) {
							angle += 360;
						}
					}else{
						if (angle >= 0) {
							angle += 360;
						}
					}

					return angle;
				}

				addPoint(x, y) {
					//Check for a new anchor
					const newAnchor =
						(this.anchorPoint === undefined) ||
						( this.anchorPoint.y > y ) ||
						( this.anchorPoint.y === y && this.anchorPoint.x > x );

					if ( newAnchor ) {
						if ( this.anchorPoint !== undefined ) {
							this.points.push(new Geometry2D.Point(this.anchorPoint.x, this.anchorPoint.y));
						}
						this.anchorPoint = new Geometry2D.Point(x, y);
					} else {
						this.points.push(new Geometry2D.Point(x, y));
					}
				}

				_sortPoints() {
					return this.points.sort( (a, b) => {
						const polarA = this._findPolarAngle(this.anchorPoint, a);
						const polarB = this._findPolarAngle(this.anchorPoint, b);

						if (polarA < polarB) {
							return -1;
						}
						if (polarA > polarB) {
							return 1;
						}

						return 0;
					});
				}

				_checkPoints(p0, p1, p2) {
					const cwAngle = this._findPolarAngle(p0, p1);
					const ccwAngle = this._findPolarAngle(p0, p2);

					if(cwAngle > ccwAngle) {
						return (cwAngle - ccwAngle <= 180);
					}

					if(cwAngle < ccwAngle) {
						return (ccwAngle - cwAngle > 180);
					}

					return true;
				}

				getHull() {
					let hullPoints = [];

					this.reverse = this.points.every(p => p.x < 0 && p.y < 0);

					let points = this._sortPoints();
					let pointsLength = points.length;

					//If there are less than 3 points, joining these points creates a correct hull.
					if(pointsLength < 3) {
						points.unshift(this.anchorPoint);
						return points;
					}

					//move first two points to output array
					hullPoints.push(points.shift(), points.shift());

					//scan is repeated until no concave points are present.
					while(true) {
						hullPoints.push(points.shift());

						let p0 = hullPoints[hullPoints.length - 3];
						let p1 = hullPoints[hullPoints.length - 2];
						let p2 = hullPoints[hullPoints.length - 1];

						if(this._checkPoints(p0, p1, p2)) {
							hullPoints.splice(hullPoints.length - 2, 1);
						}

						if(points.length == 0) {
							if(pointsLength == hullPoints.length) {
								//check for duplicate anchorPoint edge-case, if not found, add the anchorpoint as the first item.
								const ap = this.anchorPoint;

								//remove any undefined elements in the hullPoints array.
								hullPoints = hullPoints.filter(p => p);

								if(!hullPoints.some(p => p.x == ap.x && p.y == ap.y)) {
									hullPoints.unshift(this.anchorPoint);
								}
								return hullPoints;
							}

							points = hullPoints;
							pointsLength = points.length;
							hullPoints = [];
							hullPoints.push(points.shift(), points.shift());
						}
					}
				}
			};

			constructor() {
				throw new Error('Geometry2D constructor is not accessible');
			}
		};
	}
}