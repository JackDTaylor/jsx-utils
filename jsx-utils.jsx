import common from "./common/common";
import frontend from "./frontend/frontend";
import ExternalDependencyModule from "./utils/ExternalDependencyModule";

// const IS_BROWSER_ENV = (function() {
// 	try {
// 		if(window === global) {
// 			return undefined;
// 		}
// 	} catch(e) {
// 		try {
// 			if(window) {
// 				return true;
// 			}
// 		} catch(e) {
// 			return false;
// 		}
//
// 		return false;
// 	}
// })();

export class JsxUtils {
	modules = [];
	moduleMap = {};
	outputs = {};

	defaultConfig = {
		include: ['common.*'],
		exclude: [],

		reactComponentPrefix: 'dmi',
	};

	globalDependencies = {
		"*": [
			"common.Constants",

			"common.Utils.ClassUtils",
			"common.Types",
			"common.Fixes",
			"common.Decorators",

			"common.Core.*",
		],
		"frontend.*": [
			"frontend.Constants",
		],
	};

	constructor(items = {}) {
		for(const key of Object.keys(items)) {
			const moduleCls = items[key];
			const module = new moduleCls(key, this);

			this.moduleMap[key] = module;
			this.modules.push(module);
		}
	}

	provide(key, object) {
		const module = new ExternalDependencyModule(key, object, this);

		this.moduleMap[key] = module;
		this.modules.push(module);

		return this;
	}

	applyConfig(config) {
		this.config = {...this.defaultConfig, ...config };

		return this;
	}

	*resolveImportExpr(expr, withGlobalDependencies = true, parents = []) {
		let found = false;

		for(const module of this.modules) {
			if(module.isMatchingSelector(expr)) {
				found = true;

				if(module.key in this.importedModules == false) {
					this.importedModules[module.key] = module;

					for(const dependency of Array.from(module.dependencies())) {
						yield *this.resolveImportExpr(dependency, false, [...parents, module.key]);
					}

					yield module.key;
				}
			}
		}

		if(!found) {
			throw new Error(`Nothing was found by key '${expr}'`);
		}
	}

	*buildImportList() {
		this.importedModules = {};

		const includes = this.config.include instanceof Array ? this.config.include : [this.config.include];
		const excludes = this.config.exclude instanceof Array ? this.config.exclude : [this.config.exclude];

		for(const module of this.modules) {
			let include = includes.some(expr => {
				return module.isMatchingSelector(expr);
			});

			let exclude = excludes.some(expr => {
				return module.isMatchingSelector(expr);
			});

			if(include && !exclude) {
				for(const dependencyScope of Object.keys(this.globalDependencies)) {
					if(module.isMatchingSelector(dependencyScope)) {
						for(const dependency of this.globalDependencies[dependencyScope]) {
							yield *this.resolveImportExpr(dependency);
						}
					}
				}

				yield *this.resolveImportExpr(module.key);
			}
		}
	}

	isModuleRegistered(key) {
		return key in this.moduleMap;
	}

	import(config) {
		this.applyConfig(config);
		const list = Array.from(this.buildImportList());

		const moduleMap = {};
		for(const module of this.modules) {
			moduleMap[ module.key ] = module;
		}

		this.outputs = {};

		for(const moduleKey of list) {
			this.outputs[moduleKey] = moduleMap[moduleKey].import();
		}

		return this;
	}

	require(expr) {
		return this.outputs[expr];
	}
}

export default new JsxUtils({
	...common,
	...frontend,
});