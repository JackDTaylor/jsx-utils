import JsxUtilsModule from "../../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	import() {
		JSON.softParse = function() {
			try {
				return JSON.parse.apply(this, arguments);
			} catch(e) {
				console.warn('JSON.softParse failed:', e.message);
				return null;
			}
		};

		JSON.from = function(object, definition = {}) {
			if(definition instanceof Array) {
				object = object || [];

				return object.map(item => JSON.from(item, definition[0]));
			}

			if(valueType(definition) != Object) {
				if(definition instanceof Function && definition.fromJSON) {
					return definition.fromJSON(object);
				}

				return object;
			}

			const result = {...object};

			for(const key of keys(definition)) {
				if(key in result == false) {
					continue;
				}

				result[key] = JSON.from(result[key], definition[key]);
			}

			return result;
		};

		JSON.asyncFrom = async function(object, definition = {}) {
			if(definition instanceof Array) {
				object = object || [];
				if(!object.mapAsyncConcurrent) console.warn('JSON.asyncFrom object has no mapAsyncConcurrent', object);
				return await object.mapAsyncConcurrent(async item => await JSON.asyncFrom(item, definition[0]));
			}

			if(valueType(definition) != Object) {
				if(definition instanceof Function && definition.fromJSON) {
					return await definition.fromJSON(object);
				}

				return object;
			}

			const result = {...object};

			for(const key of keys(definition)) {
				if(key in result == false) {
					continue;
				}

				result[key] = await JSON.asyncFrom(result[key], definition[key]);
			}

			return result;
		};
	}
}