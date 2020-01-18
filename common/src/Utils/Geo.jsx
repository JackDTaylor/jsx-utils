import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	import() {
		global.Geo = class Geo {
			static Point2D(point) {
				if(!undefinedOrNull(arguments[1])) {
					point = {x: point, y: arguments[1] }
				}

				if(!point) {
					return null;
				}

				if(!undefinedOrNull(point.lng)) {
					return new Geometry2D.Point(+point.lng, +point.lat);
				}

				if(!undefinedOrNull(point.x)) {
					return new Geometry2D.Point(+point.x, +point.y);
				}

				if(point instanceof Array && point.length > 1) {
					return new Geometry2D.Point(+point[1], +point[0]);
				}

				console.warn('Geo.Point2D unable to parse coordinates:', point);
				return null;
			}

			static LatLngArray(...args) {
				const point = Geo.Point2D(...args);
				return [point.y, point.x];
			}

			static LongLattArray(...args) {
				const point = Geo.Point2D(...args);
				return [point.y, point.x];
			}

			static LatLng(...args) {
				const point = Geo.Point2D(...args);

				if('Leaflet' in global) {
					return new global.Leaflet.LatLng(point.y, point.x);
				}

				return {lat:point.y, lng:point.x};
			}

			/**
			 * Returns distance in meters
			 * @param from
			 * @param to
			 */
			static Distance(from, to) {
				from = Geo.LatLng(from);
				to = Geo.LatLng(to);

				const dLat = to.lat - from.lat;
				const dLon = to.lng - from.lng;

				const earthRadius = 6371000; // 6372795.477598 - changed to match Leaflet's `Earth.R`

				const alpha    = dLat/2;
				const beta     = dLon/2;

				const a = (
					Math.sin(Math.degToRad(alpha))
					* Math.sin(Math.degToRad(alpha))
				) + (
					Math.cos(Math.degToRad(from.lat))
					* Math.cos(Math.degToRad(to.lat))
					* Math.sin(Math.degToRad(beta))
					* Math.sin(Math.degToRad(beta))
				);

				const c = Math.asin(Math.min(1, Math.sqrt(a)));
				const distance = 2 * earthRadius * c;

				return Math.roundTo(distance, 4);
			}

			static DistanceKm(from, to) {
				return Geo.Distance(from, to) / 1000;
			}

			static async PointAddress(...args) {
				if('API' in global) {
					const point = Geo.Point2D(...args);
					return await global.API.get('geo.point', { lat: point.y, lon: point.x});
				}

				throw new Error('You has to define `global.API` before using `Geo.PointAddress()`');
			}
		};
	}
}