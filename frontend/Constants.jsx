export default () => {
	window.global = window;
	global.frontendData = global.frontendData || {};

	global.IsBackend = false;
	global.IsFrontend = true;

	global.StartTime = Date.now();

	global.VERBOSE = false;
	global.___ = global.React && global.React.Fragment;
	global.ReactComponentPrefix = global.ReactComponentPrefix || 'dmi';

	console.verbose = (...a) => VERBOSE && console.log(...a);
}