import { c as be } from "./createLucideIcon-BJVjolM2.js";
import { u as L } from "./index-BhgbCXxO.js";
import { r as i } from "./index-DP23ewiS.js";
import { e as B, b as Ce, d as ge, u as ke, a as W, c as xe } from "./index-yVGNjIIV.js";
import { j as a } from "./jsx-runtime-D_zvdyIk.js";
import { L as A, P as O } from "./label-CsS9m3XL.js";
import { c as U } from "./utils-CytzSlOG.js";
import "./index-BwobEAja.js";
import "./index-BGsmrW1E.js";
import "./index-FCbevRKN.js";
function Ne(e, t) {
	return i.useReducer((r, s) => t[r][s] ?? r, e);
}
var oe = (e) => {
	const { present: t, children: r } = e,
		s = ve(t),
		o = typeof r === "function" ? r({ present: s.isPresent }) : i.Children.only(r),
		n = L(s.ref, ye(o));
	return typeof r === "function" || s.isPresent ? i.cloneElement(o, { ref: n }) : null;
};
oe.displayName = "Presence";
function ve(e) {
	const [t, r] = i.useState(),
		s = i.useRef(null),
		o = i.useRef(e),
		n = i.useRef("none"),
		x = e ? "mounted" : "unmounted",
		[h, d] = Ne(x, {
			mounted: { UNMOUNT: "unmounted", ANIMATION_OUT: "unmountSuspended" },
			unmountSuspended: { MOUNT: "mounted", ANIMATION_END: "unmounted" },
			unmounted: { MOUNT: "mounted" },
		});
	return (
		i.useEffect(() => {
			const c = y(s.current);
			n.current = h === "mounted" ? c : "none";
		}, [h]),
		B(() => {
			const c = s.current,
				m = o.current;
			if (m !== e) {
				const u = n.current,
					p = y(c);
				e
					? d("MOUNT")
					: p === "none" || (c == null ? void 0 : c.display) === "none"
						? d("UNMOUNT")
						: d(m && u !== p ? "ANIMATION_OUT" : "UNMOUNT"),
					(o.current = e);
			}
		}, [e, d]),
		B(() => {
			if (t) {
				let c;
				const m = t.ownerDocument.defaultView ?? window,
					l = (p) => {
						const C = y(s.current).includes(CSS.escape(p.animationName));
						if (p.target === t && C && (d("ANIMATION_END"), !o.current)) {
							const v = t.style.animationFillMode;
							(t.style.animationFillMode = "forwards"),
								(c = m.setTimeout(() => {
									t.style.animationFillMode === "forwards" && (t.style.animationFillMode = v);
								}));
						}
					},
					u = (p) => {
						p.target === t && (n.current = y(s.current));
					};
				return (
					t.addEventListener("animationstart", u),
					t.addEventListener("animationcancel", l),
					t.addEventListener("animationend", l),
					() => {
						m.clearTimeout(c),
							t.removeEventListener("animationstart", u),
							t.removeEventListener("animationcancel", l),
							t.removeEventListener("animationend", l);
					}
				);
			} else d("ANIMATION_END");
		}, [t, d]),
		{
			isPresent: ["mounted", "unmountSuspended"].includes(h),
			ref: i.useCallback((c) => {
				(s.current = c ? getComputedStyle(c) : null), r(c);
			}, []),
		}
	);
}
function y(e) {
	return (e == null ? void 0 : e.animationName) || "none";
}
function ye(e) {
	var s, o;
	let t = (s = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : s.get,
		r = t && "isReactWarning" in t && t.isReactWarning;
	return r
		? e.ref
		: ((t = (o = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : o.get),
			(r = t && "isReactWarning" in t && t.isReactWarning),
			r ? e.props.ref : e.props.ref || e.ref);
}
var P = "Checkbox",
	[Ee] = xe(P),
	[Re, T] = Ee(P);
function _e(e) {
	const {
			__scopeCheckbox: t,
			checked: r,
			children: s,
			defaultChecked: o,
			disabled: n,
			form: x,
			name: h,
			onCheckedChange: d,
			required: c,
			value: m = "on",
			internal_do_not_use_render: l,
		} = e,
		[u, p] = ke({ prop: r, defaultProp: o ?? !1, onChange: d, caller: P }),
		[k, C] = i.useState(null),
		[v, f] = i.useState(null),
		b = i.useRef(!1),
		M = k ? !!x || !!k.closest("form") : !0,
		w = {
			checked: u,
			disabled: n,
			setChecked: p,
			control: k,
			setControl: C,
			name: h,
			form: x,
			value: m,
			hasConsumerStoppedPropagationRef: b,
			required: c,
			defaultChecked: g(o) ? !1 : o,
			isFormControl: M,
			bubbleInput: v,
			setBubbleInput: f,
		};
	return a.jsx(Re, { scope: t, ...w, children: Se(l) ? l(w) : s });
}
var ce = "CheckboxTrigger",
	ie = i.forwardRef(({ __scopeCheckbox: e, onKeyDown: t, onClick: r, ...s }, o) => {
		const {
				control: n,
				value: x,
				disabled: h,
				checked: d,
				required: c,
				setControl: m,
				setChecked: l,
				hasConsumerStoppedPropagationRef: u,
				isFormControl: p,
				bubbleInput: k,
			} = T(ce, e),
			C = L(o, m),
			v = i.useRef(d);
		return (
			i.useEffect(() => {
				const f = n == null ? void 0 : n.form;
				if (f) {
					const b = () => l(v.current);
					return f.addEventListener("reset", b), () => f.removeEventListener("reset", b);
				}
			}, [n, l]),
			a.jsx(O.button, {
				type: "button",
				role: "checkbox",
				"aria-checked": g(d) ? "mixed" : d,
				"aria-required": c,
				"data-state": pe(d),
				"data-disabled": h ? "" : void 0,
				disabled: h,
				value: x,
				...s,
				ref: C,
				onKeyDown: W(t, (f) => {
					f.key === "Enter" && f.preventDefault();
				}),
				onClick: W(r, (f) => {
					l((b) => (g(b) ? !0 : !b)),
						k && p && ((u.current = f.isPropagationStopped()), u.current || f.stopPropagation());
				}),
			})
		);
	});
ie.displayName = ce;
var F = i.forwardRef((e, t) => {
	const {
		__scopeCheckbox: r,
		name: s,
		checked: o,
		defaultChecked: n,
		required: x,
		disabled: h,
		value: d,
		onCheckedChange: c,
		form: m,
		...l
	} = e;
	return a.jsx(_e, {
		__scopeCheckbox: r,
		checked: o,
		defaultChecked: n,
		disabled: h,
		required: x,
		onCheckedChange: c,
		name: s,
		form: m,
		value: d,
		internal_do_not_use_render: ({ isFormControl: u }) =>
			a.jsxs(a.Fragment, {
				children: [
					a.jsx(ie, { ...l, ref: t, __scopeCheckbox: r }),
					u && a.jsx(me, { __scopeCheckbox: r }),
				],
			}),
	});
});
F.displayName = P;
var de = "CheckboxIndicator",
	le = i.forwardRef((e, t) => {
		const { __scopeCheckbox: r, forceMount: s, ...o } = e,
			n = T(de, r);
		return a.jsx(oe, {
			present: s || g(n.checked) || n.checked === !0,
			children: a.jsx(O.span, {
				"data-state": pe(n.checked),
				"data-disabled": n.disabled ? "" : void 0,
				...o,
				ref: t,
				style: { pointerEvents: "none", ...e.style },
			}),
		});
	});
le.displayName = de;
var ue = "CheckboxBubbleInput",
	me = i.forwardRef(({ __scopeCheckbox: e, ...t }, r) => {
		const {
				control: s,
				hasConsumerStoppedPropagationRef: o,
				checked: n,
				defaultChecked: x,
				required: h,
				disabled: d,
				name: c,
				value: m,
				form: l,
				bubbleInput: u,
				setBubbleInput: p,
			} = T(ue, e),
			k = L(r, p),
			C = Ce(n),
			v = ge(s);
		i.useEffect(() => {
			const b = u;
			if (!b) return;
			const M = window.HTMLInputElement.prototype,
				D = Object.getOwnPropertyDescriptor(M, "checked").set,
				fe = !o.current;
			if (C !== n && D) {
				const he = new Event("click", { bubbles: fe });
				(b.indeterminate = g(n)), D.call(b, g(n) ? !1 : n), b.dispatchEvent(he);
			}
		}, [u, C, n, o]);
		const f = i.useRef(g(n) ? !1 : n);
		return a.jsx(O.input, {
			type: "checkbox",
			"aria-hidden": !0,
			defaultChecked: x ?? f.current,
			required: h,
			disabled: d,
			name: c,
			value: m,
			form: l,
			...t,
			tabIndex: -1,
			ref: k,
			style: {
				...t.style,
				...v,
				position: "absolute",
				pointerEvents: "none",
				opacity: 0,
				margin: 0,
				transform: "translateX(-100%)",
			},
		});
	});
me.displayName = ue;
function Se(e) {
	return typeof e === "function";
}
function g(e) {
	return e === "indeterminate";
}
function pe(e) {
	return g(e) ? "indeterminate" : e ? "checked" : "unchecked";
} /**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const je = be("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]),
	N = i.forwardRef(({ className: e, ...t }, r) =>
		a.jsx(F, {
			ref: r,
			className: U(
				"peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
				e,
			),
			...t,
			children: a.jsx(le, {
				className: U("flex items-center justify-center text-current"),
				children: a.jsx(je, { className: "h-4 w-4" }),
			}),
		}),
	);
N.displayName = F.displayName;
try {
	(N.displayName = "Checkbox"),
		(N.__docgenInfo = {
			description: "",
			displayName: "Checkbox",
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
const Ue = {
		title: "Components/Checkbox",
		component: N,
		tags: ["autodocs"],
		argTypes: { disabled: { control: "boolean" }, checked: { control: "boolean" } },
	},
	E = {},
	R = { args: { defaultChecked: !0 } },
	_ = { args: { disabled: !0 } },
	S = { args: { disabled: !0, defaultChecked: !0 } },
	j = {
		render: () =>
			a.jsxs("div", {
				className: "flex items-center space-x-2",
				children: [
					a.jsx(N, { id: "terms" }),
					a.jsx(A, { htmlFor: "terms", children: "Accept terms and conditions" }),
				],
			}),
	},
	I = {
		render: () =>
			a.jsxs("div", {
				className: "space-y-4",
				children: [
					a.jsxs("div", {
						className: "flex items-center space-x-2",
						children: [
							a.jsx(N, { id: "marketing" }),
							a.jsx(A, { htmlFor: "marketing", children: "Receive marketing emails" }),
						],
					}),
					a.jsxs("div", {
						className: "flex items-center space-x-2",
						children: [
							a.jsx(N, { id: "notifications", defaultChecked: !0 }),
							a.jsx(A, { htmlFor: "notifications", children: "Enable notifications" }),
						],
					}),
					a.jsxs("div", {
						className: "flex items-center space-x-2",
						children: [
							a.jsx(N, { id: "analytics", disabled: !0 }),
							a.jsx(A, {
								htmlFor: "analytics",
								className: "text-muted-foreground",
								children: "Share analytics (disabled)",
							}),
						],
					}),
				],
			}),
	};
var q, H, z;
E.parameters = {
	...E.parameters,
	docs: {
		...((q = E.parameters) == null ? void 0 : q.docs),
		source: {
			originalSource: "{}",
			...((z = (H = E.parameters) == null ? void 0 : H.docs) == null ? void 0 : z.source),
		},
	},
};
var G, K, V;
R.parameters = {
	...R.parameters,
	docs: {
		...((G = R.parameters) == null ? void 0 : G.docs),
		source: {
			originalSource: `{
  args: {
    defaultChecked: true
  }
}`,
			...((V = (K = R.parameters) == null ? void 0 : K.docs) == null ? void 0 : V.source),
		},
	},
};
var X, $, J;
_.parameters = {
	..._.parameters,
	docs: {
		...((X = _.parameters) == null ? void 0 : X.docs),
		source: {
			originalSource: `{
  args: {
    disabled: true
  }
}`,
			...((J = ($ = _.parameters) == null ? void 0 : $.docs) == null ? void 0 : J.source),
		},
	},
};
var Q, Y, Z;
S.parameters = {
	...S.parameters,
	docs: {
		...((Q = S.parameters) == null ? void 0 : Q.docs),
		source: {
			originalSource: `{
  args: {
    disabled: true,
    defaultChecked: true
  }
}`,
			...((Z = (Y = S.parameters) == null ? void 0 : Y.docs) == null ? void 0 : Z.source),
		},
	},
};
var ee, te, ne;
j.parameters = {
	...j.parameters,
	docs: {
		...((ee = j.parameters) == null ? void 0 : ee.docs),
		source: {
			originalSource: `{
  render: () => <div className="flex items-center space-x-2">\r
            <Checkbox id="terms" />\r
            <Label htmlFor="terms">Accept terms and conditions</Label>\r
        </div>
}`,
			...((ne = (te = j.parameters) == null ? void 0 : te.docs) == null ? void 0 : ne.source),
		},
	},
};
var re, ae, se;
I.parameters = {
	...I.parameters,
	docs: {
		...((re = I.parameters) == null ? void 0 : re.docs),
		source: {
			originalSource: `{
  render: () => <div className="space-y-4">\r
            <div className="flex items-center space-x-2">\r
                <Checkbox id="marketing" />\r
                <Label htmlFor="marketing">Receive marketing emails</Label>\r
            </div>\r
            <div className="flex items-center space-x-2">\r
                <Checkbox id="notifications" defaultChecked />\r
                <Label htmlFor="notifications">Enable notifications</Label>\r
            </div>\r
            <div className="flex items-center space-x-2">\r
                <Checkbox id="analytics" disabled />\r
                <Label htmlFor="analytics" className="text-muted-foreground">\r
                    Share analytics (disabled)\r
                </Label>\r
            </div>\r
        </div>
}`,
			...((se = (ae = I.parameters) == null ? void 0 : ae.docs) == null ? void 0 : se.source),
		},
	},
};
const Be = ["Default", "Checked", "Disabled", "DisabledChecked", "WithLabel", "FormExample"];
export {
	R as Checked,
	E as Default,
	_ as Disabled,
	S as DisabledChecked,
	I as FormExample,
	j as WithLabel,
	Be as __namedExportsOrder,
	Ue as default,
};
