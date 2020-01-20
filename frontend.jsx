import frontend_Constants          from "./frontend/Constants";
import frontend_Classnames         from "./frontend/Classnames";
import frontend_Decorators         from "./frontend/Decorators";
import frontend_ReactComponent     from "./frontend/ReactComponent";
import frontend_Reactified_Promise from "./frontend/Reactified/ReactifiedPromise";
import frontend_Reactified_Array   from "./frontend/Reactified/ReactifiedArray";
import frontend_Reactified_Hooks   from "./frontend/Reactified/ReactifiedHooks";
import frontend_Reactified_Object  from "./frontend/Reactified/ReactifiedObject";
import frontend_URL                from "./frontend/URL";
import frontend_Envoy              from "./frontend/Envoy";

export default (dependencies) => {
	if(typeof dependencies == "undefined") {
		throw new Error("You need to provide an object with dependencies lister in README.md");
	}

	global.JsxUtilsDependencies = {
		...global.JsxUtilsDependencies,
		...dependencies,
	};

	frontend_Constants();
	frontend_Classnames();
	frontend_Decorators();
	frontend_ReactComponent();

	frontend_Reactified_Promise();
	frontend_Reactified_Array();
	frontend_Reactified_Hooks();
	frontend_Reactified_Object();

	frontend_URL();
	frontend_Envoy();
};