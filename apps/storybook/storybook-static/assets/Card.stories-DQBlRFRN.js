import { B as u } from "./button-ARXEdudZ.js";
import { r as d } from "./index-DP23ewiS.js";
import { j as e } from "./jsx-runtime-D_zvdyIk.js";
import { c as n } from "./utils-CytzSlOG.js";
import "./index-BwobEAja.js";
import "./index-BhgbCXxO.js";
const s = d.forwardRef(({ className: r, ...a }, t) =>
	e.jsx("div", {
		ref: t,
		className: n("rounded-xl border bg-card text-card-foreground shadow", r),
		...a,
	}),
);
s.displayName = "Card";
const o = d.forwardRef(({ className: r, ...a }, t) =>
	e.jsx("div", { ref: t, className: n("flex flex-col space-y-1.5 p-6", r), ...a }),
);
o.displayName = "CardHeader";
const c = d.forwardRef(({ className: r, ...a }, t) =>
	e.jsx("h3", { ref: t, className: n("font-semibold leading-none tracking-tight", r), ...a }),
);
c.displayName = "CardTitle";
const i = d.forwardRef(({ className: r, ...a }, t) =>
	e.jsx("p", { ref: t, className: n("text-sm text-muted-foreground", r), ...a }),
);
i.displayName = "CardDescription";
const l = d.forwardRef(({ className: r, ...a }, t) =>
	e.jsx("div", { ref: t, className: n("p-6 pt-0", r), ...a }),
);
l.displayName = "CardContent";
const p = d.forwardRef(({ className: r, ...a }, t) =>
	e.jsx("div", { ref: t, className: n("flex items-center p-6 pt-0", r), ...a }),
);
p.displayName = "CardFooter";
try {
	(s.displayName = "Card"), (s.__docgenInfo = { description: "", displayName: "Card", props: {} });
} catch {}
try {
	(o.displayName = "CardHeader"),
		(o.__docgenInfo = { description: "", displayName: "CardHeader", props: {} });
} catch {}
try {
	(p.displayName = "CardFooter"),
		(p.__docgenInfo = { description: "", displayName: "CardFooter", props: {} });
} catch {}
try {
	(c.displayName = "CardTitle"),
		(c.__docgenInfo = { description: "", displayName: "CardTitle", props: {} });
} catch {}
try {
	(i.displayName = "CardDescription"),
		(i.__docgenInfo = { description: "", displayName: "CardDescription", props: {} });
} catch {}
try {
	(l.displayName = "CardContent"),
		(l.__docgenInfo = { description: "", displayName: "CardContent", props: {} });
} catch {}
const E = { title: "Components/Card", component: s, tags: ["autodocs"] },
	m = {
		render: () =>
			e.jsxs(s, {
				className: "w-[350px]",
				children: [
					e.jsxs(o, {
						children: [
							e.jsx(c, { children: "Card Title" }),
							e.jsx(i, { children: "Card description goes here." }),
						],
					}),
					e.jsx(l, { children: e.jsx("p", { children: "Card content with some example text." }) }),
					e.jsx(p, { children: e.jsx(u, { children: "Action" }) }),
				],
			}),
	},
	x = {
		render: () =>
			e.jsx(s, {
				className: "w-[350px] p-6",
				children: e.jsx("p", { children: "A simple card with just content." }),
			}),
	},
	C = {
		render: () =>
			e.jsxs(s, {
				className: "w-[350px]",
				children: [
					e.jsxs(o, {
						children: [
							e.jsx(c, { children: "Create Account" }),
							e.jsx(i, { children: "Enter your details below." }),
						],
					}),
					e.jsxs(l, {
						className: "space-y-4",
						children: [
							e.jsxs("div", {
								className: "space-y-2",
								children: [
									e.jsx("label", { className: "text-sm font-medium", children: "Email" }),
									e.jsx("input", {
										type: "email",
										placeholder: "email@example.com",
										className:
											"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm",
									}),
								],
							}),
							e.jsxs("div", {
								className: "space-y-2",
								children: [
									e.jsx("label", { className: "text-sm font-medium", children: "Password" }),
									e.jsx("input", {
										type: "password",
										className:
											"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm",
									}),
								],
							}),
						],
					}),
					e.jsxs(p, {
						className: "flex justify-between",
						children: [
							e.jsx(u, { variant: "outline", children: "Cancel" }),
							e.jsx(u, { children: "Create" }),
						],
					}),
				],
			}),
	};
var _, y, f;
m.parameters = {
	...m.parameters,
	docs: {
		...((_ = m.parameters) == null ? void 0 : _.docs),
		source: {
			originalSource: `{
  render: () => <Card className="w-[350px]">\r
            <CardHeader>\r
                <CardTitle>Card Title</CardTitle>\r
                <CardDescription>Card description goes here.</CardDescription>\r
            </CardHeader>\r
            <CardContent>\r
                <p>Card content with some example text.</p>\r
            </CardContent>\r
            <CardFooter>\r
                <Button>Action</Button>\r
            </CardFooter>\r
        </Card>
}`,
			...((f = (y = m.parameters) == null ? void 0 : y.docs) == null ? void 0 : f.source),
		},
	},
};
var N, h, j;
x.parameters = {
	...x.parameters,
	docs: {
		...((N = x.parameters) == null ? void 0 : N.docs),
		source: {
			originalSource: `{
  render: () => <Card className="w-[350px] p-6">\r
            <p>A simple card with just content.</p>\r
        </Card>
}`,
			...((j = (h = x.parameters) == null ? void 0 : h.docs) == null ? void 0 : j.source),
		},
	},
};
var w, g, b;
C.parameters = {
	...C.parameters,
	docs: {
		...((w = C.parameters) == null ? void 0 : w.docs),
		source: {
			originalSource: `{
  render: () => <Card className="w-[350px]">\r
            <CardHeader>\r
                <CardTitle>Create Account</CardTitle>\r
                <CardDescription>Enter your details below.</CardDescription>\r
            </CardHeader>\r
            <CardContent className="space-y-4">\r
                <div className="space-y-2">\r
                    <label className="text-sm font-medium">Email</label>\r
                    <input type="email" placeholder="email@example.com" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" />\r
                </div>\r
                <div className="space-y-2">\r
                    <label className="text-sm font-medium">Password</label>\r
                    <input type="password" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" />\r
                </div>\r
            </CardContent>\r
            <CardFooter className="flex justify-between">\r
                <Button variant="outline">Cancel</Button>\r
                <Button>Create</Button>\r
            </CardFooter>\r
        </Card>
}`,
			...((b = (g = C.parameters) == null ? void 0 : g.docs) == null ? void 0 : b.source),
		},
	},
};
const R = ["Default", "Simple", "WithForm"];
export { m as Default, x as Simple, C as WithForm, R as __namedExportsOrder, E as default };
