import { r as u, a as z } from "./index-DP23ewiS.js";
import { j as C } from "./jsx-runtime-D_zvdyIk.js";

function g(t, e = []) {
	let o = [];
	function f(c, r) {
		const n = u.createContext(r),
			i = o.length;
		o = [...o, r];
		const S = (l) => {
			var v;
			const { scope: a, children: x, ...b } = l,
				h = ((v = a == null ? void 0 : a[t]) == null ? void 0 : v[i]) || n,
				p = u.useMemo(() => b, Object.values(b));
			return C.jsx(h.Provider, { value: p, children: x });
		};
		S.displayName = `${c}Provider`;
		function d(l, a) {
			var h;
			const x = ((h = a == null ? void 0 : a[t]) == null ? void 0 : h[i]) || n,
				b = u.useContext(x);
			if (b) return b;
			if (r !== void 0) return r;
			throw new Error(`\`${l}\` must be used within \`${c}\``);
		}
		return [S, d];
	}
	const s = () => {
		const c = o.map((r) => u.createContext(r));
		return (n) => {
			const i = (n == null ? void 0 : n[t]) || c;
			return u.useMemo(() => ({ [`__scope${t}`]: { ...n, [t]: i } }), [n, i]);
		};
	};
	return (s.scopeName = t), [f, w(s, ...e)];
}
function w(...t) {
	const e = t[0];
	if (t.length === 1) return e;
	const o = () => {
		const f = t.map((s) => ({ useScope: s(), scopeName: s.scopeName }));
		return (c) => {
			const r = f.reduce((n, { useScope: i, scopeName: S }) => {
				const l = i(c)[`__scope${S}`];
				return { ...n, ...l };
			}, {});
			return u.useMemo(() => ({ [`__scope${e.scopeName}`]: r }), [r]);
		};
	};
	return (o.scopeName = e.scopeName), o;
}
function j(t, e, { checkForDefaultPrevented: o = !0 } = {}) {
	return (s) => {
		if ((t == null || t(s), o === !1 || !s.defaultPrevented)) return e == null ? void 0 : e(s);
	};
}
var m = globalThis?.document ? u.useLayoutEffect : () => {},
	y = z[" useInsertionEffect ".trim().toString()] || m;
function A({ prop: t, defaultProp: e, onChange: o = () => {}, caller: f }) {
	const [s, c, r] = P({ defaultProp: e, onChange: o }),
		n = t !== void 0,
		i = n ? t : s;
	{
		const d = u.useRef(t !== void 0);
		u.useEffect(() => {
			const l = d.current;
			l !== n &&
				console.warn(
					`${f} is changing from ${l ? "controlled" : "uncontrolled"} to ${n ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`,
				),
				(d.current = n);
		}, [n, f]);
	}
	const S = u.useCallback(
		(d) => {
			var l;
			if (n) {
				const a = $(d) ? d(t) : d;
				a !== t && ((l = r.current) == null || l.call(r, a));
			} else c(d);
		},
		[n, t, c, r],
	);
	return [i, S];
}
function P({ defaultProp: t, onChange: e }) {
	const [o, f] = u.useState(t),
		s = u.useRef(o),
		c = u.useRef(e);
	return (
		y(() => {
			c.current = e;
		}, [e]),
		u.useEffect(() => {
			var r;
			s.current !== o && ((r = c.current) == null || r.call(c, o), (s.current = o));
		}, [o, s]),
		[o, f, c]
	);
}
function $(t) {
	return typeof t === "function";
}
function E(t) {
	const e = u.useRef({ value: t, previous: t });
	return u.useMemo(
		() => (
			e.current.value !== t && ((e.current.previous = e.current.value), (e.current.value = t)),
			e.current.previous
		),
		[t],
	);
}
function M(t) {
	const [e, o] = u.useState(void 0);
	return (
		m(() => {
			if (t) {
				o({ width: t.offsetWidth, height: t.offsetHeight });
				const f = new ResizeObserver((s) => {
					if (!Array.isArray(s) || !s.length) return;
					const c = s[0];
					let r, n;
					if ("borderBoxSize" in c) {
						const i = c.borderBoxSize,
							S = Array.isArray(i) ? i[0] : i;
						(r = S.inlineSize), (n = S.blockSize);
					} else (r = t.offsetWidth), (n = t.offsetHeight);
					o({ width: r, height: n });
				});
				return f.observe(t, { box: "border-box" }), () => f.unobserve(t);
			} else o(void 0);
		}, [t]),
		e
	);
}
export { j as a, E as b, g as c, M as d, m as e, A as u };
