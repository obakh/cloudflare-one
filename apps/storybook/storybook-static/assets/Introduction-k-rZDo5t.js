import { M as t } from "./index-BzGMAZF_.js";
import { useMDXComponents as s } from "./index-CH6z84fh.js";
import { j as n } from "./jsx-runtime-D_zvdyIk.js";
import "./index-DP23ewiS.js";
import "./iframe-C46WraOt.js";
import "./index-BGsmrW1E.js";
import "./index-FCbevRKN.js";
import "./index-DgH-xKnr.js";
import "./index-DrFu-skq.js";
function r(i) {
	const e = {
		a: "a",
		code: "code",
		h1: "h1",
		h2: "h2",
		li: "li",
		p: "p",
		pre: "pre",
		strong: "strong",
		ul: "ul",
		...s(),
		...i.components,
	};
	return n.jsxs(n.Fragment, {
		children: [
			`
`,
			`
`,
			n.jsx(t, { title: "Introduction" }),
			`
`,
			n.jsx(e.h1, { id: "repoui-component-library", children: "@repo/ui Component Library" }),
			`
`,
			n.jsxs(e.p, {
				children: [
					"Welcome to the UI component library for this monorepo template. This Storybook documents all available components from the ",
					n.jsx(e.code, { children: "@repo/ui" }),
					" package.",
				],
			}),
			`
`,
			n.jsx(e.h2, { id: "getting-started", children: "Getting Started" }),
			`
`,
			n.jsx(e.p, { children: "Install the package in your app:" }),
			`
`,
			n.jsx(e.pre, {
				children: n.jsx(e.code, {
					className: "language-bash",
					children: `pnpm add @repo/ui
`,
				}),
			}),
			`
`,
			n.jsx(e.p, { children: "Import components:" }),
			`
`,
			n.jsx(e.pre, {
				children: n.jsx(e.code, {
					className: "language-tsx",
					children: `import { Button } from "@repo/ui/button";\r
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/card";\r
import { Input } from "@repo/ui/input";
`,
				}),
			}),
			`
`,
			n.jsx(e.h2, { id: "available-components", children: "Available Components" }),
			`
`,
			n.jsxs(e.ul, {
				children: [
					`
`,
					n.jsxs(e.li, {
						children: [
							n.jsx(e.strong, { children: "Button" }),
							" - Primary action buttons with multiple variants",
						],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [
							n.jsx(e.strong, { children: "Card" }),
							" - Container component for grouping content",
						],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [n.jsx(e.strong, { children: "Input" }), " - Text input fields"],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [n.jsx(e.strong, { children: "Badge" }), " - Status indicators and labels"],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [n.jsx(e.strong, { children: "Checkbox" }), " - Boolean selection control"],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [n.jsx(e.strong, { children: "Switch" }), " - Toggle control"],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [n.jsx(e.strong, { children: "Label" }), " - Form field labels"],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [n.jsx(e.strong, { children: "Select" }), " - Dropdown selection"],
					}),
					`
`,
					n.jsxs(e.li, { children: [n.jsx(e.strong, { children: "Dialog" }), " - Modal dialogs"] }),
					`
`,
					n.jsxs(e.li, {
						children: [n.jsx(e.strong, { children: "Dropdown Menu" }), " - Context menus"],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [n.jsx(e.strong, { children: "Tabs" }), " - Tabbed navigation"],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [n.jsx(e.strong, { children: "Tooltip" }), " - Hover information"],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [n.jsx(e.strong, { children: "Avatar" }), " - User profile images"],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [n.jsx(e.strong, { children: "Skeleton" }), " - Loading placeholders"],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [n.jsx(e.strong, { children: "Spinner" }), " - Loading indicators"],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [n.jsx(e.strong, { children: "Separator" }), " - Visual dividers"],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [n.jsx(e.strong, { children: "Textarea" }), " - Multi-line text input"],
					}),
					`
`,
				],
			}),
			`
`,
			n.jsx(e.h2, { id: "theming", children: "Theming" }),
			`
`,
			n.jsx(e.p, {
				children:
					"Components support light and dark themes via CSS variables. Use the theme toggle in the toolbar above to preview both modes.",
			}),
			`
`,
			n.jsx(e.h2, { id: "built-with", children: "Built With" }),
			`
`,
			n.jsxs(e.ul, {
				children: [
					`
`,
					n.jsxs(e.li, {
						children: [
							n.jsx(e.a, {
								href: "https://www.radix-ui.com/",
								rel: "nofollow",
								children: "Radix UI",
							}),
							" - Unstyled, accessible components",
						],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [
							n.jsx(e.a, {
								href: "https://tailwindcss.com/",
								rel: "nofollow",
								children: "Tailwind CSS",
							}),
							" - Utility-first CSS",
						],
					}),
					`
`,
					n.jsxs(e.li, {
						children: [
							n.jsx(e.a, {
								href: "https://cva.style/",
								rel: "nofollow",
								children: "class-variance-authority",
							}),
							" - Variant management",
						],
					}),
					`
`,
				],
			}),
		],
	});
}
function m(i = {}) {
	const { wrapper: e } = { ...s(), ...i.components };
	return e ? n.jsx(e, { ...i, children: n.jsx(r, { ...i }) }) : r(i);
}
export { m as default };
