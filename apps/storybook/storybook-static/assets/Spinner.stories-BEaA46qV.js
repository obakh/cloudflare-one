import { c as S } from "./createLucideIcon-BJVjolM2.js";
import { j as e } from "./jsx-runtime-D_zvdyIk.js";
import { c as g } from "./utils-CytzSlOG.js";
import "./index-DP23ewiS.js"; /**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const w = S("LoaderCircle", [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]]);
function s({ className: t, size: f = "default", ...h }) {
	const N = { sm: "h-4 w-4", default: "h-5 w-5", lg: "h-6 w-6" };
	return e.jsx(w, { className: g("animate-spin", N[f], t), ...h });
}
try {
	(s.displayName = "Spinner"),
		(s.__docgenInfo = {
			description: "",
			displayName: "Spinner",
			props: {
				size: {
					defaultValue: { value: "default" },
					description: "",
					name: "size",
					required: !1,
					type: {
						name: "enum",
						value: [{ value: '"sm"' }, { value: '"default"' }, { value: '"lg"' }],
					},
				},
			},
		});
} catch {}
const z = { title: "Components/Spinner", component: s, tags: ["autodocs"] },
	a = {},
	r = {
		render: () =>
			e.jsxs("div", {
				className: "flex items-center gap-4",
				children: [
					e.jsx(s, { className: "h-4 w-4" }),
					e.jsx(s, { className: "h-6 w-6" }),
					e.jsx(s, { className: "h-8 w-8" }),
					e.jsx(s, { className: "h-12 w-12" }),
				],
			}),
	},
	n = {
		render: () =>
			e.jsxs("div", {
				className: "flex items-center gap-2",
				children: [
					e.jsx(s, { className: "h-4 w-4" }),
					e.jsx("span", { className: "text-sm text-muted-foreground", children: "Loading..." }),
				],
			}),
	};
var c, o, i;
a.parameters = {
	...a.parameters,
	docs: {
		...((c = a.parameters) == null ? void 0 : c.docs),
		source: {
			originalSource: "{}",
			...((i = (o = a.parameters) == null ? void 0 : o.docs) == null ? void 0 : i.source),
		},
	},
};
var m, l, d;
r.parameters = {
	...r.parameters,
	docs: {
		...((m = r.parameters) == null ? void 0 : m.docs),
		source: {
			originalSource: `{
  render: () => <div className="flex items-center gap-4">\r
            <Spinner className="h-4 w-4" />\r
            <Spinner className="h-6 w-6" />\r
            <Spinner className="h-8 w-8" />\r
            <Spinner className="h-12 w-12" />\r
        </div>
}`,
			...((d = (l = r.parameters) == null ? void 0 : l.docs) == null ? void 0 : d.source),
		},
	},
};
var p, u, x;
n.parameters = {
	...n.parameters,
	docs: {
		...((p = n.parameters) == null ? void 0 : p.docs),
		source: {
			originalSource: `{
  render: () => <div className="flex items-center gap-2">\r
            <Spinner className="h-4 w-4" />\r
            <span className="text-sm text-muted-foreground">Loading...</span>\r
        </div>
}`,
			...((x = (u = n.parameters) == null ? void 0 : u.docs) == null ? void 0 : x.source),
		},
	},
};
const L = ["Default", "Sizes", "WithText"];
export { a as Default, r as Sizes, n as WithText, L as __namedExportsOrder, z as default };
