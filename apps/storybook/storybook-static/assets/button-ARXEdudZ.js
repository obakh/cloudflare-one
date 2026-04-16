import { S as f } from "./index-BhgbCXxO.js";
import { c as u } from "./index-BwobEAja.js";
import { r as l } from "./index-DP23ewiS.js";
import { j as d } from "./jsx-runtime-D_zvdyIk.js";
import { c } from "./utils-CytzSlOG.js";

const p = u(
		"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
		{
			variants: {
				variant: {
					default: "bg-primary text-primary-foreground hover:bg-primary/90",
					destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
					secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
					ghost: "hover:bg-accent hover:text-accent-foreground",
					link: "text-primary underline-offset-4 hover:underline",
				},
				size: {
					default: "h-9 px-4 py-2",
					sm: "h-8 rounded-md px-3 text-xs",
					lg: "h-10 rounded-md px-6",
					icon: "h-9 w-9",
				},
			},
			defaultVariants: { variant: "default", size: "default" },
		},
	),
	e = l.forwardRef(({ className: t, variant: r, size: n, asChild: o = !1, ...a }, i) => {
		const s = o ? f : "button";
		return d.jsx(s, { className: c(p({ variant: r, size: n, className: t })), ref: i, ...a });
	});
e.displayName = "Button";
try {
	(e.displayName = "Button"),
		(e.__docgenInfo = {
			description: "",
			displayName: "Button",
			props: {
				asChild: {
					defaultValue: { value: "false" },
					description: "",
					name: "asChild",
					required: !1,
					type: { name: "boolean" },
				},
				variant: {
					defaultValue: null,
					description: "",
					name: "variant",
					required: !1,
					type: {
						name: '"link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null',
					},
				},
				size: {
					defaultValue: null,
					description: "",
					name: "size",
					required: !1,
					type: { name: '"sm" | "default" | "lg" | "icon" | null' },
				},
			},
		});
} catch {}
export { e as B };
