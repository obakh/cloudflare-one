import { d as R } from "./index-DrFu-skq.js";
import { j as _ } from "./jsx-runtime-D_zvdyIk.js";
import "./index-DP23ewiS.js";
const {
		useParameter: S,
		addons: L,
		useEffect: P,
		useMemo: w,
		definePreview: B,
	} = __STORYBOOK_MODULE_PREVIEW_API__,
	{ deprecate: M } = __STORYBOOK_MODULE_CLIENT_LOGGER__;
var x = Object.defineProperty,
	T = (e, t) => {
		for (var r in t) x(e, r, { get: t[r], enumerable: !0 });
	},
	A = {};
T(A, { initialGlobals: () => N });
var a = "themes",
	g = `storybook/${a}`,
	p = "theme",
	d = {},
	G = { REGISTER_THEMES: `${g}/REGISTER_THEMES` },
	N = { [p]: "" },
	b = {};
T(b, {
	initializeThemeState: () => f,
	pluckThemeFromContext: () => u,
	useThemeParameters: () => y,
});
function u({ globals: e }) {
	return e[p] || "";
}
function y(e) {
	return (
		M(R`The useThemeParameters function is deprecated. Please access parameters via the context directly instead e.g.
    - const { themeOverride } = context.parameters.themes ?? {};
    `),
		e ? (e.parameters[a] ?? d) : S(a, d)
	);
}
function f(e, t) {
	L.getChannel().emit(G.REGISTER_THEMES, { defaultTheme: t, themes: e });
}
var D = "html",
	h = (e) => e.split(" ").filter(Boolean),
	I = ({ themes: e, defaultTheme: t, parentSelector: r = D }) => (
		f(Object.keys(e), t),
		(v, i) => {
			const { themeOverride: o } = i.parameters[a] ?? {},
				n = u(i);
			return (
				P(() => {
					const l = o || n || t,
						s = document.querySelector(r);
					if (!s) return;
					Object.entries(e)
						.filter(([E]) => E !== l)
						.forEach(([_E, O]) => {
							const c = h(O);
							c.length > 0 && s.classList.remove(...c);
						});
					const m = h(e[l]);
					m.length > 0 && s.classList.add(...m);
				}, [o, n]),
				v()
			);
		}
	);
const H = {
	parameters: {
		controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
		layout: "centered",
	},
	decorators: [
		I({ themes: { light: "", dark: "dark" }, defaultTheme: "light" }),
		(e) => _.jsx("div", { className: "font-sans antialiased", children: _.jsx(e, {}) }),
	],
};
export { H as default };
