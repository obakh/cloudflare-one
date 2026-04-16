import { r as P } from "./index-DP23ewiS.js";
import { j as e } from "./jsx-runtime-D_zvdyIk.js";
import { L as N } from "./label-CsS9m3XL.js";
import { c as R } from "./utils-CytzSlOG.js";
import "./index-BwobEAja.js";
import "./index-BGsmrW1E.js";
import "./index-FCbevRKN.js";
import "./index-BhgbCXxO.js";
const r = P.forwardRef(({ className: n, type: D, ...F }, S) =>
	e.jsx("input", {
		type: D,
		className: R(
			"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
			n,
		),
		ref: S,
		...F,
	}),
);
r.displayName = "Input";
try {
	(r.displayName = "Input"),
		(r.__docgenInfo = { description: "", displayName: "Input", props: {} });
} catch {}
const A = {
		title: "Components/Input",
		component: r,
		tags: ["autodocs"],
		argTypes: {
			type: {
				control: "select",
				options: ["text", "email", "password", "number", "search", "tel", "url"],
			},
			disabled: { control: "boolean" },
			placeholder: { control: "text" },
		},
	},
	a = { args: { placeholder: "Enter text..." } },
	s = { args: { type: "email", placeholder: "email@example.com" } },
	o = { args: { type: "password", placeholder: "Enter password" } },
	l = { args: { placeholder: "Disabled input", disabled: !0 } },
	t = {
		render: () =>
			e.jsxs("div", {
				className: "grid w-full max-w-sm gap-1.5",
				children: [
					e.jsx(N, { htmlFor: "email", children: "Email" }),
					e.jsx(r, { type: "email", id: "email", placeholder: "email@example.com" }),
				],
			}),
	},
	i = {
		render: () =>
			e.jsxs("div", {
				className: "grid w-full max-w-sm gap-1.5",
				children: [
					e.jsx(N, { htmlFor: "file", children: "Upload file" }),
					e.jsx(r, { id: "file", type: "file" }),
				],
			}),
	};
var p, d, m;
a.parameters = {
	...a.parameters,
	docs: {
		...((p = a.parameters) == null ? void 0 : p.docs),
		source: {
			originalSource: `{
  args: {
    placeholder: "Enter text..."
  }
}`,
			...((m = (d = a.parameters) == null ? void 0 : d.docs) == null ? void 0 : m.source),
		},
	},
};
var c, u, f;
s.parameters = {
	...s.parameters,
	docs: {
		...((c = s.parameters) == null ? void 0 : c.docs),
		source: {
			originalSource: `{
  args: {
    type: "email",
    placeholder: "email@example.com"
  }
}`,
			...((f = (u = s.parameters) == null ? void 0 : u.docs) == null ? void 0 : f.source),
		},
	},
};
var g, x, b;
o.parameters = {
	...o.parameters,
	docs: {
		...((g = o.parameters) == null ? void 0 : g.docs),
		source: {
			originalSource: `{
  args: {
    type: "password",
    placeholder: "Enter password"
  }
}`,
			...((b = (x = o.parameters) == null ? void 0 : x.docs) == null ? void 0 : b.source),
		},
	},
};
var h, w, y;
l.parameters = {
	...l.parameters,
	docs: {
		...((h = l.parameters) == null ? void 0 : h.docs),
		source: {
			originalSource: `{
  args: {
    placeholder: "Disabled input",
    disabled: true
  }
}`,
			...((y = (w = l.parameters) == null ? void 0 : w.docs) == null ? void 0 : y.source),
		},
	},
};
var E, _, j;
t.parameters = {
	...t.parameters,
	docs: {
		...((E = t.parameters) == null ? void 0 : E.docs),
		source: {
			originalSource: `{
  render: () => <div className="grid w-full max-w-sm gap-1.5">\r
            <Label htmlFor="email">Email</Label>\r
            <Input type="email" id="email" placeholder="email@example.com" />\r
        </div>
}`,
			...((j = (_ = t.parameters) == null ? void 0 : _.docs) == null ? void 0 : j.source),
		},
	},
};
var v, I, L;
i.parameters = {
	...i.parameters,
	docs: {
		...((v = i.parameters) == null ? void 0 : v.docs),
		source: {
			originalSource: `{
  render: () => <div className="grid w-full max-w-sm gap-1.5">\r
            <Label htmlFor="file">Upload file</Label>\r
            <Input id="file" type="file" />\r
        </div>
}`,
			...((L = (I = i.parameters) == null ? void 0 : I.docs) == null ? void 0 : L.source),
		},
	},
};
const B = ["Default", "Email", "Password", "Disabled", "WithLabel", "File"];
export {
	a as Default,
	l as Disabled,
	s as Email,
	i as File,
	o as Password,
	t as WithLabel,
	B as __namedExportsOrder,
	A as default,
};
