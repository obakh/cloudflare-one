import { c as l } from "./client-oRtOyOAv.js";
import { r as s } from "./index-DP23ewiS.js";
import "./index-FCbevRKN.js";
var n = new Map();
function m() {
	return globalThis.IS_REACT_ACT_ENVIRONMENT;
}
var a = ({ callback: e, children: r }) => {
	const t = s.useRef();
	return (
		s.useLayoutEffect(() => {
			t.current !== e && ((t.current = e), e());
		}, [e]),
		r
	);
};
typeof Promise.withResolvers > "u" &&
	(Promise.withResolvers = () => {
		let e = null,
			r = null;
		return {
			promise: new Promise((t, o) => {
				(e = t), (r = o);
			}),
			resolve: e,
			reject: r,
		};
	});
var v = async (e, r, t) => {
		const o = await c(r, t);
		if (m()) {
			o.render(e);
			return;
		}
		const { promise: i, resolve: u } = Promise.withResolvers();
		return o.render(s.createElement(a, { callback: u }, e)), i;
	},
	f = (e, _r) => {
		const t = n.get(e);
		t && (t.unmount(), n.delete(e));
	},
	c = async (e, r) => {
		let t = n.get(e);
		return t || ((t = l.createRoot(e, r)), n.set(e, t)), t;
	};
export { v as renderElement, f as unmountElement };
