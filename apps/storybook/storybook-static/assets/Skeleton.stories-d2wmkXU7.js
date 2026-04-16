import { j as e } from "./jsx-runtime-D_zvdyIk.js";
import { c as S } from "./utils-CytzSlOG.js";

function s({ className: d, ...j }) {
	return e.jsx("div", { className: S("animate-pulse rounded-md bg-primary/10", d), ...j });
}
try {
	(s.displayName = "Skeleton"),
		(s.__docgenInfo = { description: "", displayName: "Skeleton", props: {} });
} catch {}
const y = { title: "Components/Skeleton", component: s, tags: ["autodocs"] },
	a = { render: () => e.jsx(s, { className: "h-4 w-[250px]" }) },
	r = { render: () => e.jsx(s, { className: "h-12 w-12 rounded-full" }) },
	n = {
		render: () =>
			e.jsxs("div", {
				className: "flex items-center space-x-4",
				children: [
					e.jsx(s, { className: "h-12 w-12 rounded-full" }),
					e.jsxs("div", {
						className: "space-y-2",
						children: [
							e.jsx(s, { className: "h-4 w-[250px]" }),
							e.jsx(s, { className: "h-4 w-[200px]" }),
						],
					}),
				],
			}),
	},
	c = {
		render: () =>
			e.jsxs("div", {
				className: "w-[350px] rounded-xl border p-6 space-y-4",
				children: [
					e.jsxs("div", {
						className: "space-y-2",
						children: [
							e.jsx(s, { className: "h-5 w-[150px]" }),
							e.jsx(s, { className: "h-4 w-[200px]" }),
						],
					}),
					e.jsx(s, { className: "h-[125px] w-full rounded-md" }),
					e.jsx("div", {
						className: "flex justify-end",
						children: e.jsx(s, { className: "h-9 w-[100px]" }),
					}),
				],
			}),
	};
var o, l, t;
a.parameters = {
	...a.parameters,
	docs: {
		...((o = a.parameters) == null ? void 0 : o.docs),
		source: {
			originalSource: `{
  render: () => <Skeleton className="h-4 w-[250px]" />
}`,
			...((t = (l = a.parameters) == null ? void 0 : l.docs) == null ? void 0 : t.source),
		},
	},
};
var m, p, i;
r.parameters = {
	...r.parameters,
	docs: {
		...((m = r.parameters) == null ? void 0 : m.docs),
		source: {
			originalSource: `{
  render: () => <Skeleton className="h-12 w-12 rounded-full" />
}`,
			...((i = (p = r.parameters) == null ? void 0 : p.docs) == null ? void 0 : i.source),
		},
	},
};
var x, u, N;
n.parameters = {
	...n.parameters,
	docs: {
		...((x = n.parameters) == null ? void 0 : x.docs),
		source: {
			originalSource: `{
  render: () => <div className="flex items-center space-x-4">\r
            <Skeleton className="h-12 w-12 rounded-full" />\r
            <div className="space-y-2">\r
                <Skeleton className="h-4 w-[250px]" />\r
                <Skeleton className="h-4 w-[200px]" />\r
            </div>\r
        </div>
}`,
			...((N = (u = n.parameters) == null ? void 0 : u.docs) == null ? void 0 : N.source),
		},
	},
};
var h, w, f;
c.parameters = {
	...c.parameters,
	docs: {
		...((h = c.parameters) == null ? void 0 : h.docs),
		source: {
			originalSource: `{
  render: () => <div className="w-[350px] rounded-xl border p-6 space-y-4">\r
            <div className="space-y-2">\r
                <Skeleton className="h-5 w-[150px]" />\r
                <Skeleton className="h-4 w-[200px]" />\r
            </div>\r
            <Skeleton className="h-[125px] w-full rounded-md" />\r
            <div className="flex justify-end">\r
                <Skeleton className="h-9 w-[100px]" />\r
            </div>\r
        </div>
}`,
			...((f = (w = c.parameters) == null ? void 0 : w.docs) == null ? void 0 : f.source),
		},
	},
};
const g = ["Default", "Circle", "Card", "CardLoading"];
export {
	n as Card,
	c as CardLoading,
	r as Circle,
	a as Default,
	g as __namedExportsOrder,
	y as default,
};
