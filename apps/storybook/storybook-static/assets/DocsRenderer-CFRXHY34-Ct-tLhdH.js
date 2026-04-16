const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f || (m.f = ["./index-CH6z84fh.js", "./index-DP23ewiS.js"]),
) => i.map((i) => d[i]);

import { c as R } from "./client-oRtOyOAv.js";
import { _ as l } from "./iframe-C46WraOt.js";
import { D as d, C as E, A as h, H as p } from "./index-BzGMAZF_.js";
import { R as n, r as s } from "./index-DP23ewiS.js";
import "./jsx-runtime-D_zvdyIk.js";
import "./index-BGsmrW1E.js";
import "./index-FCbevRKN.js";
import "./index-DgH-xKnr.js";
import "./index-DrFu-skq.js";
var i = new Map();
function v() {
	return globalThis.IS_REACT_ACT_ENVIRONMENT;
}
var f = ({ callback: e, children: t }) => {
	const r = s.useRef();
	return (
		s.useLayoutEffect(() => {
			r.current !== e && ((r.current = e), e());
		}, [e]),
		t
	);
};
typeof Promise.withResolvers > "u" &&
	(Promise.withResolvers = () => {
		let e = null,
			t = null;
		return {
			promise: new Promise((r, o) => {
				(e = r), (t = o);
			}),
			resolve: e,
			reject: t,
		};
	});
var w = async (e, t, r) => {
		const o = await x(t, r);
		if (v()) {
			o.render(e);
			return;
		}
		const { promise: a, resolve: m } = Promise.withResolvers();
		return o.render(s.createElement(f, { callback: m }, e)), a;
	},
	_ = (e, _t) => {
		const r = i.get(e);
		r && (r.unmount(), i.delete(e));
	},
	x = async (e, t) => {
		let r = i.get(e);
		return r || ((r = R.createRoot(e, t)), i.set(e, r)), r;
	},
	g = { code: E, a: h, ...p },
	y = class extends s.Component {
		constructor() {
			super(...arguments), (this.state = { hasError: !1 });
		}
		static getDerivedStateFromError() {
			return { hasError: !0 };
		}
		componentDidCatch(e) {
			const { showException: t } = this.props;
			t(e);
		}
		render() {
			const { hasError: e } = this.state,
				{ children: t } = this.props;
			return e ? null : n.createElement(n.Fragment, null, t);
		}
	},
	S = class {
		constructor() {
			(this.render = async (e, t, r) => {
				const o = { ...g, ...(t == null ? void 0 : t.components) },
					a = d;
				return new Promise((m, c) => {
					l(
						async () => {
							const { MDXProvider: u } = await import("./index-CH6z84fh.js");
							return { MDXProvider: u };
						},
						__vite__mapDeps([0, 1]),
						import.meta.url,
					)
						.then(({ MDXProvider: u }) =>
							w(
								n.createElement(
									y,
									{ showException: c, key: Math.random() },
									n.createElement(
										u,
										{ components: o },
										n.createElement(a, { context: e, docsParameter: t }),
									),
								),
								r,
							),
						)
						.then(() => m());
				});
			}),
				(this.unmount = (e) => {
					_(e);
				});
		}
	};
export { S as DocsRenderer, g as defaultComponents };
