export default () => {
	global.LinearProgressionGenerator = function *LinearProgressionGenerator(step = 1, start = 0) {
		let i = start;

		while(true) {
			yield i += step;
		}
	};

	global.Counter = class Counter {
		constructor(step = 1, start = 0) {
			this.counter = LinearProgressionGenerator(step, start);
		}

		get next() {
			return this.counter.next().value;
		}
	};

	global.CacheStorageEx = class CacheStorageEx extends Map {
		idCounter = new Counter;

		id(val) {
			if(this.has(val) == false) {
				this.set(val, this.idCounter.next);
			}

			return this.get(val);
		}
	};

	global.ObjectIndexer = class ObjectIndexer extends WeakMap {
		idCounter = new Counter;

		id(val) {
			if(this.has(val) == false) {
				this.set(val, this.idCounter.next);
			}

			return this.get(val);
		}
	};

	let uniqueId = Symbol('ObjectUID');
	let uniqueIdCounter = new Counter;

	global.ObjectUID = function ObjectUID(item) {
		if(uniqueId in item == false) {
			item[uniqueId] = uniqueIdCounter.next;
		}

		return item[uniqueId];
	};

	global.PrototypeUID = function PrototypeUID(item) {
		if(item.hasOwnProperty(uniqueId) == false) {
			Object.defineProperty(item, uniqueId, {
				value: uniqueIdCounter.next,
				enumerable: false,
				configurable: false,
				writable: false,
			});
		}

		return item[uniqueId];
	};
}