import { c as u } from "./index-BwobEAja.js";
import { r as s } from "./index-DP23ewiS.js";
import { j as l } from "./jsx-runtime-D_zvdyIk.js";
import { c as b } from "./utils-CytzSlOG.js";
import "./index-BGsmrW1E.js";
import { c as y } from "./index-BhgbCXxO.js";

var v = [
		"a",
		"button",
		"div",
		"form",
		"h2",
		"h3",
		"img",
		"input",
		"label",
		"li",
		"nav",
		"ol",
		"p",
		"select",
		"span",
		"svg",
		"ul",
	],
	w = v.reduce((e, r) => {
		const a = y(`Primitive.${r}`),
			o = s.forwardRef((t, m) => {
				const { asChild: c, ...f } = t,
					p = c ? a : r;
				return (
					typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), l.jsx(p, { ...f, ref: m })
				);
			});
		return (o.displayName = `Primitive.${r}`), { ...e, [r]: o };
	}, {}),
	x = "Label",
	n = s.forwardRef((e, r) =>
		l.jsx(w.label, {
			...e,
			ref: r,
			onMouseDown: (a) => {
				var t;
				a.target.closest("button, input, select, textarea") ||
					((t = e.onMouseDown) == null || t.call(e, a),
					!a.defaultPrevented && a.detail > 1 && a.preventDefault());
			},
		}),
	);
n.displayName = x;
var d = n;
const N = u(
		"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
	),
	i = s.forwardRef(({ className: e, ...r }, a) => l.jsx(d, { ref: a, className: b(N(), e), ...r }));
i.displayName = d.displayName;
try {
	(i.displayName = "Label"),
		(i.__docgenInfo = {
			description: "",
			displayName: "Label",
			props: {
				asChild: {
					defaultValue: null,
					description: "",
					name: "asChild",
					required: !1,
					type: { name: "boolean" },
				},
			},
		});
} catch {}
export { i as L, w as P };
