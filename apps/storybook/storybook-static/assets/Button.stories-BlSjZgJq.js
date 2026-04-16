import { B as e } from "./button-ARXEdudZ.js";
import { j as r } from "./jsx-runtime-D_zvdyIk.js";
import "./index-DP23ewiS.js";
import "./index-BwobEAja.js";
import "./utils-CytzSlOG.js";
import "./index-BhgbCXxO.js";
const U = {
		title: "Components/Button",
		component: e,
		tags: ["autodocs"],
		argTypes: {
			variant: {
				control: "select",
				options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
			},
			size: { control: "select", options: ["default", "sm", "lg", "icon"] },
			disabled: { control: "boolean" },
		},
	},
	a = { args: { children: "Button", variant: "default" } },
	n = { args: { children: "Delete", variant: "destructive" } },
	t = { args: { children: "Outline", variant: "outline" } },
	s = { args: { children: "Secondary", variant: "secondary" } },
	o = { args: { children: "Ghost", variant: "ghost" } },
	i = { args: { children: "Link", variant: "link" } },
	c = { args: { children: "Small", size: "sm" } },
	l = { args: { children: "Large", size: "lg" } },
	d = { args: { children: "Disabled", disabled: !0 } },
	u = {
		render: () =>
			r.jsxs("div", {
				className: "flex flex-wrap gap-4",
				children: [
					r.jsx(e, { variant: "default", children: "Default" }),
					r.jsx(e, { variant: "secondary", children: "Secondary" }),
					r.jsx(e, { variant: "destructive", children: "Destructive" }),
					r.jsx(e, { variant: "outline", children: "Outline" }),
					r.jsx(e, { variant: "ghost", children: "Ghost" }),
					r.jsx(e, { variant: "link", children: "Link" }),
				],
			}),
	};
var m, p, g;
a.parameters = {
	...a.parameters,
	docs: {
		...((m = a.parameters) == null ? void 0 : m.docs),
		source: {
			originalSource: `{
  args: {
    children: "Button",
    variant: "default"
  }
}`,
			...((g = (p = a.parameters) == null ? void 0 : p.docs) == null ? void 0 : g.source),
		},
	},
};
var v, h, S;
n.parameters = {
	...n.parameters,
	docs: {
		...((v = n.parameters) == null ? void 0 : v.docs),
		source: {
			originalSource: `{
  args: {
    children: "Delete",
    variant: "destructive"
  }
}`,
			...((S = (h = n.parameters) == null ? void 0 : h.docs) == null ? void 0 : S.source),
		},
	},
};
var f, B, x;
t.parameters = {
	...t.parameters,
	docs: {
		...((f = t.parameters) == null ? void 0 : f.docs),
		source: {
			originalSource: `{
  args: {
    children: "Outline",
    variant: "outline"
  }
}`,
			...((x = (B = t.parameters) == null ? void 0 : B.docs) == null ? void 0 : x.source),
		},
	},
};
var D, y, k;
s.parameters = {
	...s.parameters,
	docs: {
		...((D = s.parameters) == null ? void 0 : D.docs),
		source: {
			originalSource: `{
  args: {
    children: "Secondary",
    variant: "secondary"
  }
}`,
			...((k = (y = s.parameters) == null ? void 0 : y.docs) == null ? void 0 : k.source),
		},
	},
};
var L, j, b;
o.parameters = {
	...o.parameters,
	docs: {
		...((L = o.parameters) == null ? void 0 : L.docs),
		source: {
			originalSource: `{
  args: {
    children: "Ghost",
    variant: "ghost"
  }
}`,
			...((b = (j = o.parameters) == null ? void 0 : j.docs) == null ? void 0 : b.source),
		},
	},
};
var O, G, z;
i.parameters = {
	...i.parameters,
	docs: {
		...((O = i.parameters) == null ? void 0 : O.docs),
		source: {
			originalSource: `{
  args: {
    children: "Link",
    variant: "link"
  }
}`,
			...((z = (G = i.parameters) == null ? void 0 : G.docs) == null ? void 0 : z.source),
		},
	},
};
var w, A, E;
c.parameters = {
	...c.parameters,
	docs: {
		...((w = c.parameters) == null ? void 0 : w.docs),
		source: {
			originalSource: `{
  args: {
    children: "Small",
    size: "sm"
  }
}`,
			...((E = (A = c.parameters) == null ? void 0 : A.docs) == null ? void 0 : E.source),
		},
	},
};
var N, V, _;
l.parameters = {
	...l.parameters,
	docs: {
		...((N = l.parameters) == null ? void 0 : N.docs),
		source: {
			originalSource: `{
  args: {
    children: "Large",
    size: "lg"
  }
}`,
			...((_ = (V = l.parameters) == null ? void 0 : V.docs) == null ? void 0 : _.source),
		},
	},
};
var C, R, T;
d.parameters = {
	...d.parameters,
	docs: {
		...((C = d.parameters) == null ? void 0 : C.docs),
		source: {
			originalSource: `{
  args: {
    children: "Disabled",
    disabled: true
  }
}`,
			...((T = (R = d.parameters) == null ? void 0 : R.docs) == null ? void 0 : T.source),
		},
	},
};
var q, F, H;
u.parameters = {
	...u.parameters,
	docs: {
		...((q = u.parameters) == null ? void 0 : q.docs),
		source: {
			originalSource: `{
  render: () => <div className="flex flex-wrap gap-4">\r
            <Button variant="default">Default</Button>\r
            <Button variant="secondary">Secondary</Button>\r
            <Button variant="destructive">Destructive</Button>\r
            <Button variant="outline">Outline</Button>\r
            <Button variant="ghost">Ghost</Button>\r
            <Button variant="link">Link</Button>\r
        </div>
}`,
			...((H = (F = u.parameters) == null ? void 0 : F.docs) == null ? void 0 : H.source),
		},
	},
};
const W = [
	"Default",
	"Destructive",
	"Outline",
	"Secondary",
	"Ghost",
	"Link",
	"Small",
	"Large",
	"Disabled",
	"AllVariants",
];
export {
	u as AllVariants,
	a as Default,
	n as Destructive,
	d as Disabled,
	o as Ghost,
	l as Large,
	i as Link,
	t as Outline,
	s as Secondary,
	c as Small,
	W as __namedExportsOrder,
	U as default,
};
