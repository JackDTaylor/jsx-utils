import ReactFragmentExHook from "./CreateElement/ReactFragmentExHook";
import InternalRefHook from "./CreateElement/InternalRefHook";
import ContextualHook from "./CreateElement/ContextualHook";

export default () => [
	ReactFragmentExHook(),
	InternalRefHook(),
	ContextualHook(),
];