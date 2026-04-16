import { u as J } from "./index-BhgbCXxO.js";
import { r as s } from "./index-DP23ewiS.js";
import { b as ce, d as de, a as ie, c as ne, u as oe } from "./index-yVGNjIIV.js";
import { j as e } from "./jsx-runtime-D_zvdyIk.js";
import { P as K, L as S } from "./label-CsS9m3XL.js";
import { c as P } from "./utils-CytzSlOG.js";
import "./index-BwobEAja.js";
import "./index-BGsmrW1E.js";
import "./index-FCbevRKN.js";
var C = "Switch",
	[le] = ne(C),
	[ue, me] = le(C),
	Q = s.forwardRef((r, o) => {
		const {
				__scopeSwitch: t,
				name: i,
				checked: n,
				defaultChecked: j,
				required: l,
				disabled: c,
				value: u = "on",
				onCheckedChange: y,
				form: d,
				...N
			} = r,
			[m, p] = s.useState(null),
			_ = J(o, (h) => p(h)),
			E = s.useRef(!1),
			L = m ? d || !!m.closest("form") : !0,
			[f, se] = oe({ prop: n, defaultProp: j ?? !1, onChange: y, caller: C });
		return e.jsxs(ue, {
			scope: t,
			checked: f,
			disabled: c,
			children: [
				e.jsx(K.button, {
					type: "button",
					role: "switch",
					"aria-checked": f,
					"aria-required": l,
					"data-state": te(f),
					"data-disabled": c ? "" : void 0,
					disabled: c,
					value: u,
					...N,
					ref: _,
					onClick: ie(r.onClick, (h) => {
						se((ae) => !ae),
							L && ((E.current = h.isPropagationStopped()), E.current || h.stopPropagation());
					}),
				}),
				L &&
					e.jsx(ee, {
						control: m,
						bubbles: !E.current,
						name: i,
						value: u,
						checked: f,
						required: l,
						disabled: c,
						form: d,
						style: { transform: "translateX(-100%)" },
					}),
			],
		});
	});
Q.displayName = C;
var Y = "SwitchThumb",
	Z = s.forwardRef((r, o) => {
		const { __scopeSwitch: t, ...i } = r,
			n = me(Y, t);
		return e.jsx(K.span, {
			"data-state": te(n.checked),
			"data-disabled": n.disabled ? "" : void 0,
			...i,
			ref: o,
		});
	});
Z.displayName = Y;
var pe = "SwitchBubbleInput",
	ee = s.forwardRef(({ __scopeSwitch: r, control: o, checked: t, bubbles: i = !0, ...n }, j) => {
		const l = s.useRef(null),
			c = J(l, j),
			u = ce(t),
			y = de(o);
		return (
			s.useEffect(() => {
				const d = l.current;
				if (!d) return;
				const N = window.HTMLInputElement.prototype,
					p = Object.getOwnPropertyDescriptor(N, "checked").set;
				if (u !== t && p) {
					const _ = new Event("click", { bubbles: i });
					p.call(d, t), d.dispatchEvent(_);
				}
			}, [u, t, i]),
			e.jsx("input", {
				type: "checkbox",
				"aria-hidden": !0,
				defaultChecked: t,
				...n,
				tabIndex: -1,
				ref: c,
				style: {
					...n.style,
					...y,
					position: "absolute",
					pointerEvents: "none",
					opacity: 0,
					margin: 0,
				},
			})
		);
	});
ee.displayName = pe;
function te(r) {
	return r ? "checked" : "unchecked";
}
var re = Q,
	fe = Z;
const a = s.forwardRef(({ className: r, ...o }, t) =>
	e.jsx(re, {
		className: P(
			"peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
			r,
		),
		...o,
		ref: t,
		children: e.jsx(fe, {
			className: P(
				"pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
			),
		}),
	}),
);
a.displayName = re.displayName;
try {
	(a.displayName = "Switch"),
		(a.__docgenInfo = {
			description: "",
			displayName: "Switch",
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
const je = {
		title: "Components/Switch",
		component: a,
		tags: ["autodocs"],
		argTypes: { disabled: { control: "boolean" }, checked: { control: "boolean" } },
	},
	b = {},
	x = { args: { defaultChecked: !0 } },
	v = { args: { disabled: !0 } },
	w = { args: { disabled: !0, defaultChecked: !0 } },
	g = {
		render: () =>
			e.jsxs("div", {
				className: "flex items-center space-x-2",
				children: [
					e.jsx(a, { id: "airplane-mode" }),
					e.jsx(S, { htmlFor: "airplane-mode", children: "Airplane Mode" }),
				],
			}),
	},
	k = {
		render: () =>
			e.jsxs("div", {
				className: "space-y-4",
				children: [
					e.jsxs("div", {
						className: "flex items-center justify-between",
						children: [
							e.jsx(S, { htmlFor: "dark-mode", children: "Dark Mode" }),
							e.jsx(a, { id: "dark-mode" }),
						],
					}),
					e.jsxs("div", {
						className: "flex items-center justify-between",
						children: [
							e.jsx(S, { htmlFor: "notifications", children: "Notifications" }),
							e.jsx(a, { id: "notifications", defaultChecked: !0 }),
						],
					}),
					e.jsxs("div", {
						className: "flex items-center justify-between",
						children: [
							e.jsx(S, {
								htmlFor: "beta",
								className: "text-muted-foreground",
								children: "Beta Features (disabled)",
							}),
							e.jsx(a, { id: "beta", disabled: !0 }),
						],
					}),
				],
			}),
	};
var R, F, B;
b.parameters = {
	...b.parameters,
	docs: {
		...((R = b.parameters) == null ? void 0 : R.docs),
		source: {
			originalSource: "{}",
			...((B = (F = b.parameters) == null ? void 0 : F.docs) == null ? void 0 : B.source),
		},
	},
};
var D, M, T;
x.parameters = {
	...x.parameters,
	docs: {
		...((D = x.parameters) == null ? void 0 : D.docs),
		source: {
			originalSource: `{
  args: {
    defaultChecked: true
  }
}`,
			...((T = (M = x.parameters) == null ? void 0 : M.docs) == null ? void 0 : T.source),
		},
	},
};
var I, A, H;
v.parameters = {
	...v.parameters,
	docs: {
		...((I = v.parameters) == null ? void 0 : I.docs),
		source: {
			originalSource: `{
  args: {
    disabled: true
  }
}`,
			...((H = (A = v.parameters) == null ? void 0 : A.docs) == null ? void 0 : H.source),
		},
	},
};
var q, O, U;
w.parameters = {
	...w.parameters,
	docs: {
		...((q = w.parameters) == null ? void 0 : q.docs),
		source: {
			originalSource: `{
  args: {
    disabled: true,
    defaultChecked: true
  }
}`,
			...((U = (O = w.parameters) == null ? void 0 : O.docs) == null ? void 0 : U.source),
		},
	},
};
var W, z, V;
g.parameters = {
	...g.parameters,
	docs: {
		...((W = g.parameters) == null ? void 0 : W.docs),
		source: {
			originalSource: `{
  render: () => <div className="flex items-center space-x-2">\r
            <Switch id="airplane-mode" />\r
            <Label htmlFor="airplane-mode">Airplane Mode</Label>\r
        </div>
}`,
			...((V = (z = g.parameters) == null ? void 0 : z.docs) == null ? void 0 : V.source),
		},
	},
};
var X, $, G;
k.parameters = {
	...k.parameters,
	docs: {
		...((X = k.parameters) == null ? void 0 : X.docs),
		source: {
			originalSource: `{
  render: () => <div className="space-y-4">\r
            <div className="flex items-center justify-between">\r
                <Label htmlFor="dark-mode">Dark Mode</Label>\r
                <Switch id="dark-mode" />\r
            </div>\r
            <div className="flex items-center justify-between">\r
                <Label htmlFor="notifications">Notifications</Label>\r
                <Switch id="notifications" defaultChecked />\r
            </div>\r
            <div className="flex items-center justify-between">\r
                <Label htmlFor="beta" className="text-muted-foreground">\r
                    Beta Features (disabled)\r
                </Label>\r
                <Switch id="beta" disabled />\r
            </div>\r
        </div>
}`,
			...((G = ($ = k.parameters) == null ? void 0 : $.docs) == null ? void 0 : G.source),
		},
	},
};
const ye = ["Default", "Checked", "Disabled", "DisabledChecked", "WithLabel", "SettingsExample"];
export {
	x as Checked,
	b as Default,
	v as Disabled,
	w as DisabledChecked,
	k as SettingsExample,
	g as WithLabel,
	ye as __namedExportsOrder,
	je as default,
};
