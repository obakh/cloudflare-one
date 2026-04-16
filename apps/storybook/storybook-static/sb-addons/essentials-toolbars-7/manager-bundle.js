try {
	(() => {
		var a = __REACT__,
			{
				Children: le,
				Component: ie,
				Fragment: ue,
				Profiler: pe,
				PureComponent: ce,
				StrictMode: me,
				Suspense: de,
				__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: be,
				cloneElement: _e,
				createContext: Se,
				createElement: ye,
				createFactory: Oe,
				createRef: Te,
				forwardRef: ve,
				isValidElement: Ce,
				lazy: ke,
				memo: fe,
				startTransition: ge,
				unstable_act: Ie,
				useCallback: v,
				useContext: Ee,
				useDebugValue: xe,
				useDeferredValue: De,
				useEffect: E,
				useId: Ae,
				useImperativeHandle: Re,
				useInsertionEffect: he,
				useLayoutEffect: Le,
				useMemo: Be,
				useReducer: Pe,
				useRef: h,
				useState: L,
				useSyncExternalStore: Me,
				useTransition: Ne,
				version: Ue,
			} = __REACT__;
		var _Fe = __STORYBOOK_API__,
			{
				ActiveTabs: Ge,
				Consumer: Ke,
				ManagerContext: Ye,
				Provider: $e,
				RequestResponseError: qe,
				addons: x,
				combineParameters: ze,
				controlOrMetaKey: je,
				controlOrMetaSymbol: Ze,
				eventMatchesShortcut: Je,
				eventToShortcut: Qe,
				experimental_MockUniversalStore: Xe,
				experimental_UniversalStore: et,
				experimental_requestResponse: tt,
				experimental_useUniversalStore: ot,
				isMacLike: rt,
				isShortcutTaken: nt,
				keyToSymbol: at,
				merge: st,
				mockChannel: lt,
				optionOrAltSymbol: it,
				shortcutMatchesShortcut: ut,
				shortcutToHumanString: pt,
				types: B,
				useAddonState: ct,
				useArgTypes: mt,
				useArgs: dt,
				useChannel: bt,
				useGlobalTypes: P,
				useGlobals: D,
				useParameter: _t,
				useSharedState: St,
				useStoryPrepared: yt,
				useStorybookApi: M,
				useStorybookState: Ot,
			} = __STORYBOOK_API__;
		var _ft = __STORYBOOK_COMPONENTS__,
			{
				A: gt,
				ActionBar: It,
				AddonPanel: Et,
				Badge: xt,
				Bar: Dt,
				Blockquote: At,
				Button: Rt,
				ClipboardCode: ht,
				Code: Lt,
				DL: Bt,
				Div: Pt,
				DocumentWrapper: Mt,
				EmptyTabContent: Nt,
				ErrorFormatter: Ut,
				FlexBar: Vt,
				Form: wt,
				H1: Ht,
				H2: Wt,
				H3: Ft,
				H4: Gt,
				H5: Kt,
				H6: Yt,
				HR: $t,
				IconButton: N,
				IconButtonSkeleton: qt,
				Icons: A,
				Img: zt,
				LI: jt,
				Link: Zt,
				ListItem: Jt,
				Loader: Qt,
				Modal: Xt,
				OL: eo,
				P: to,
				Placeholder: oo,
				Pre: ro,
				ProgressSpinner: no,
				ResetWrapper: ao,
				ScrollArea: so,
				Separator: U,
				Spaced: lo,
				Span: io,
				StorybookIcon: uo,
				StorybookLogo: po,
				Symbols: co,
				SyntaxHighlighter: mo,
				TT: bo,
				TabBar: _o,
				TabButton: So,
				TabWrapper: yo,
				Table: Oo,
				Tabs: To,
				TabsState: vo,
				TooltipLinkList: V,
				TooltipMessage: Co,
				TooltipNote: ko,
				UL: fo,
				WithTooltip: w,
				WithTooltipPure: go,
				Zoom: Io,
				codeCommon: Eo,
				components: xo,
				createCopyToClipboardFunction: Do,
				getStoryHref: Ao,
				icons: Ro,
				interleaveSeparators: ho,
				nameSpaceClassNames: Lo,
				resetComponents: Bo,
				withReset: Po,
			} = __STORYBOOK_COMPONENTS__;
		var G = { type: "item", value: "" },
			K = (o, t) => ({
				...t,
				name: t.name || o,
				description: t.description || o,
				toolbar: {
					...t.toolbar,
					items: t.toolbar.items.map((e) => {
						const r = typeof e === "string" ? { value: e, title: e } : e;
						return (
							r.type === "reset" &&
								t.toolbar.icon &&
								((r.icon = t.toolbar.icon), (r.hideIcon = !0)),
							{ ...G, ...r }
						);
					}),
				},
			}),
			Y = ["reset"],
			$ = (o) => o.filter((t) => !Y.includes(t.type)).map((t) => t.value),
			_ = "addon-toolbars",
			q = async (o, t, e) => {
				e?.next &&
					(await o.setAddonShortcut(_, {
						label: e.next.label,
						defaultShortcut: e.next.keys,
						actionName: `${t}:next`,
						action: e.next.action,
					})),
					e?.previous &&
						(await o.setAddonShortcut(_, {
							label: e.previous.label,
							defaultShortcut: e.previous.keys,
							actionName: `${t}:previous`,
							action: e.previous.action,
						})),
					e?.reset &&
						(await o.setAddonShortcut(_, {
							label: e.reset.label,
							defaultShortcut: e.reset.keys,
							actionName: `${t}:reset`,
							action: e.reset.action,
						}));
			},
			z = (o) => (t) => {
				const {
						id: e,
						toolbar: { items: r, shortcuts: n },
					} = t,
					p = M(),
					[S, i] = D(),
					s = h([]),
					u = S[e],
					C = v(() => {
						i({ [e]: "" });
					}, [i]),
					k = v(() => {
						const l = s.current,
							m = l.indexOf(u),
							d = m === l.length - 1 ? 0 : m + 1,
							c = s.current[d];
						i({ [e]: c });
					}, [s, u, i]),
					f = v(() => {
						const l = s.current,
							m = l.indexOf(u),
							d = m > -1 ? m : 0,
							c = d === 0 ? l.length - 1 : d - 1,
							b = s.current[c];
						i({ [e]: b });
					}, [s, u, i]);
				return (
					E(() => {
						n &&
							q(p, e, {
								next: { ...n.next, action: k },
								previous: { ...n.previous, action: f },
								reset: { ...n.reset, action: C },
							});
					}, [p, e, n, k, f, C]),
					E(() => {
						s.current = $(r);
					}, []),
					a.createElement(o, { cycleValues: s.current, ...t })
				);
			},
			H = ({ currentValue: o, items: t }) =>
				o != null && t.find((e) => e.value === o && e.type !== "reset"),
			j = ({ currentValue: o, items: t }) => {
				const e = H({ currentValue: o, items: t });
				if (e) return e.icon;
			},
			Z = ({ currentValue: o, items: t }) => {
				const e = H({ currentValue: o, items: t });
				if (e) return e.title;
			},
			J = ({ active: o, disabled: t, title: e, icon: r, description: n, onClick: p }) =>
				a.createElement(
					N,
					{ active: o, title: n, disabled: t, onClick: t ? () => {} : p },
					r && a.createElement(A, { icon: r, __suppressDeprecationWarning: !0 }),
					e ? `\xA0${e}` : null,
				),
			Q = ({
				right: o,
				title: t,
				value: e,
				icon: r,
				hideIcon: n,
				onClick: p,
				disabled: S,
				currentValue: i,
			}) => {
				const s =
						r &&
						a.createElement(A, {
							style: { opacity: 1 },
							icon: r,
							__suppressDeprecationWarning: !0,
						}),
					u = { id: e ?? "_reset", active: i === e, right: o, title: t, disabled: S, onClick: p };
				return r && !n && (u.icon = s), u;
			},
			X = z(
				({
					id: o,
					name: t,
					description: e,
					toolbar: { icon: r, items: n, title: p, preventDynamicIcon: S, dynamicTitle: i },
				}) => {
					let [s, u, C] = D(),
						[k, f] = L(!1),
						l = s[o],
						m = !!l,
						d = o in C,
						c = r,
						b = p;
					S || (c = j({ currentValue: l, items: n }) || c),
						i && (b = Z({ currentValue: l, items: n }) || b),
						!b && !c && console.warn(`Toolbar '${t}' has no title or icon`);
					const W = v(
						(I) => {
							u({ [o]: I });
						},
						[o, u],
					);
					return a.createElement(
						w,
						{
							placement: "top",
							tooltip: ({ onHide: I }) => {
								const F = n
									.filter(({ type: g }) => {
										let R = !0;
										return g === "reset" && !l && (R = !1), R;
									})
									.map((g) =>
										Q({
											...g,
											currentValue: l,
											disabled: d,
											onClick: () => {
												W(g.value), I();
											},
										}),
									);
								return a.createElement(V, { links: F });
							},
							closeOnOutsideClick: !0,
							onVisibleChange: f,
						},
						a.createElement(J, {
							active: k || m,
							disabled: d,
							description: e || "",
							icon: c,
							title: b || "",
						}),
					);
				},
			),
			ee = () => {
				const o = P(),
					t = Object.keys(o).filter((e) => !!o[e].toolbar);
				return t.length
					? a.createElement(
							a.Fragment,
							null,
							a.createElement(U, null),
							t.map((e) => {
								const r = K(e, o[e]);
								return a.createElement(X, { key: e, id: e, ...r });
							}),
						)
					: null;
			};
		x.register(_, () =>
			x.add(_, {
				title: _,
				type: B.TOOL,
				match: ({ tabId: o }) => !o,
				render: () => a.createElement(ee, null),
			}),
		);
	})();
} catch (e) {
	console.error(`[Storybook] One of your manager-entries failed: ${import.meta.url}`, e);
}
