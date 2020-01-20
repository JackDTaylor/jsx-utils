# jsx-utils

**JSX Utils** is a library that overhauls a lot of things in JS and React

## Installation and dependencies
You need to provide default exports for the following modules (you should require them by yourself) like  this:
```js
import fileSaver from "file-saver";
import React from "react";
import Bluebird from "bluebird";
import jQuery from "jquery";
import querystring from "querystring";

import jsxUtilsCommon from "jsx-utils/common";
import jsxUtilsFrontend from "jsx-utils/frontend";

(cfg => {
	jsxUtilsCommon(cfg);
	jsxUtilsFrontend(cfg);
})({
	"file-saver":  fileSaver,
	"react":       React,
	"bluebird":    Bluebird,
	"jquery":      jQuery,
	"querystring": querystring,
});
```

You may pass `null` or an empty/non-empty object if needed. Search this repo for `JsxUtilsDependencies` to see what may
break if the particular dependency is not provided.