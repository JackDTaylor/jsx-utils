import common_Constants                 from "./common/Constants";

import common_Utils_Range               from "./common/Utils/Range";
import common_Utils_Random              from "./common/Utils/Random";
import common_Utils_Colorizer           from "./common/Utils/Colorizer";
import common_Utils_Animate             from "./common/Utils/Animate";
import common_Utils_Geometry            from "./common/Utils/Geometry";
import common_Utils_Geometry2D          from "./common/Utils/Geometry2D";
import common_Utils_Plural              from "./common/Utils/Plural";
import common_Utils_CycleSafety         from "./common/Utils/CycleSafety";
import common_Utils_Throttler           from "./common/Utils/Throttler";
import common_Utils_Geo                 from "./common/Utils/Geo";
import common_Utils_KeyboardLayout      from "./common/Utils/KeyboardLayout";
import common_Utils_ClassUtils          from "./common/Utils/ClassUtils";
import common_Utils_CacheStorage        from "./common/Utils/CacheStorage";
import common_Utils_Noun                from "./common/Utils/Noun";

import common_Utils_Helpers_PhoneHelper from "./common/Utils/Helpers/PhoneHelper";

import common_Fixes                     from "./common/Fixes";
import common_Types                     from "./common/Types";
import common_Async                     from "./common/Async";
import common_Decorators                from "./common/Decorators";
import common_Validators                from "./common/Validators";

import common_Core_Object               from "./common/Core/Object";
import common_Core_Function             from "./common/Core/Function";
import common_Core_Number               from "./common/Core/Number";
import common_Core_String               from "./common/Core/String";
import common_Core_StringCrypt          from "./common/Core/StringCrypt";
import common_Core_Array                from "./common/Core/Array";
import common_Core_Date                 from "./common/Core/Date";
import common_Core_JSON                 from "./common/Core/JSON";
import common_Core_RegExp               from "./common/Core/RegExp";
import common_Core_Math                 from "./common/Core/Math";

import common_Errors                    from "./common/Errors";
import common_Models                    from "./common/Models";
import common_FileModel                 from "./common/FileModel";

export default (dependencies) => {
	if(typeof dependencies == "undefined") {
		throw new Error("You need to provide an object with dependencies lister in README.md");
	}

	global.JsxUtilsDependencies = {
		...global.JsxUtilsDependencies,
		...dependencies,
	};

	common_Constants();
	common_Utils_Range();
	common_Utils_Random();
	common_Utils_Colorizer();
	common_Utils_Animate();
	common_Utils_Geometry();
	common_Utils_Geometry2D();
	common_Utils_Plural();
	common_Utils_CycleSafety();
	common_Utils_Throttler();
	common_Utils_Geo();
	common_Utils_KeyboardLayout();
	common_Utils_ClassUtils();

	common_Fixes();
	common_Types();

	common_Async();
	common_Decorators();
	common_Validators();

	common_Core_Object();
	common_Core_Function();
	common_Core_Number();
	common_Core_String();
	common_Core_StringCrypt();
	common_Core_Array();
	common_Core_Date();
	common_Core_JSON();
	common_Core_RegExp();
	common_Core_Math();

	common_Errors();
	common_Models();
	common_FileModel();
	common_Utils_CacheStorage();
	common_Utils_Noun();
	common_Utils_Helpers_PhoneHelper();
};