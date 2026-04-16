import { j as r } from "./jsx-runtime-D_zvdyIk.js";
import "./index-DP23ewiS.js";
import { c as j } from "./index-BwobEAja.js";
import { c as O } from "./utils-CytzSlOG.js";

const N = j(
	"inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
				outline: "text-foreground",
			},
		},
		defaultVariants: { variant: "default" },
	},
);
function e({ className: c, variant: D, ..._ }) {
	return r.jsx("div", { className: O(N({ variant: D }), c), ..._ });
}
try {
	(e.displayName = "Badge"),
		(e.__docgenInfo = {
			description: "",
			displayName: "Badge",
			props: {
				variant: {
					defaultValue: null,
					description: "",
					name: "variant",
					required: !1,
					type: { name: '"default" | "destructive" | "outline" | "secondary" | null' },
				},
			},
		});
} catch {}
const q = {
		title: "Components/Badge",
		component: e,
		tags: ["autodocs"],
		argTypes: {
			variant: { control: "select", options: ["default", "secondary", "destructive", "outline"] },
		},
	},
	a = { args: { children: "Badge" } },
	t = { args: { children: "Secondary", variant: "secondary" } },
	n = { args: { children: "Destructive", variant: "destructive" } },
	s = { args: { children: "Outline", variant: "outline" } },
	o = {
		render: () =>
			r.jsxs("div", {
				className: "flex gap-2",
				children: [
					r.jsx(e, { children: "Default" }),
					r.jsx(e, { variant: "secondary", children: "Secondary" }),
					r.jsx(e, { variant: "destructive", children: "Destructive" }),
					r.jsx(e, { variant: "outline", children: "Outline" }),
				],
			}),
	};
var i, d, u;
a.parameters = {
	...a.parameters,
	docs: {
		...((i = a.parameters) == null ? void 0 : i.docs),
		source: {
			originalSource: `{
  args: {
    children: "Badge"
  }
}`,
			...((u = (d = a.parameters) == null ? void 0 : d.docs) == null ? void 0 : u.source),
		},
	},
};
var l, p, g;
t.parameters = {
	...t.parameters,
	docs: {
		...((l = t.parameters) == null ? void 0 : l.docs),
		source: {
			originalSource: `{
  args: {
    children: "Secondary",
    variant: "secondary"
  }
}`,
			...((g = (p = t.parameters) == null ? void 0 : p.docs) == null ? void 0 : g.source),
		},
	},
};
var m, v, f;
n.parameters = {
	...n.parameters,
	docs: {
		...((m = n.parameters) == null ? void 0 : m.docs),
		source: {
			originalSource: `{
  args: {
    children: "Destructive",
    variant: "destructive"
  }
}`,
			...((f = (v = n.parameters) == null ? void 0 : v.docs) == null ? void 0 : f.source),
		},
	},
};
var y, x, h;
s.parameters = {
	...s.parameters,
	docs: {
		...((y = s.parameters) == null ? void 0 : y.docs),
		source: {
			originalSource: `{
  args: {
    children: "Outline",
    variant: "outline"
  }
}`,
			...((h = (x = s.parameters) == null ? void 0 : x.docs) == null ? void 0 : h.source),
		},
	},
};
var B, b, S;
o.parameters = {
	...o.parameters,
	docs: {
		...((B = o.parameters) == null ? void 0 : B.docs),
		source: {
			originalSource: `{
  render: () => <div className="flex gap-2">\r
            <Badge>Default</Badge>\r
            <Badge variant="secondary">Secondary</Badge>\r
            <Badge variant="destructive">Destructive</Badge>\r
            <Badge variant="outline">Outline</Badge>\r
        </div>
}`,
			...((S = (b = o.parameters) == null ? void 0 : b.docs) == null ? void 0 : S.source),
		},
	},
};
const C = ["Default", "Secondary", "Destructive", "Outline", "AllVariants"];
export {
	o as AllVariants,
	a as Default,
	n as Destructive,
	s as Outline,
	t as Secondary,
	C as __namedExportsOrder,
	q as default,
};
