try {
	(() => {
		var re = Object.create;
		var W = Object.defineProperty;
		var ae = Object.getOwnPropertyDescriptor;
		var ie = Object.getOwnPropertyNames;
		var ce = Object.getPrototypeOf,
			se = Object.prototype.hasOwnProperty;
		var E = ((e) =>
			typeof require < "u"
				? require
				: typeof Proxy < "u"
					? new Proxy(e, { get: (o, c) => (typeof require < "u" ? require : o)[c] })
					: e)(function (e) {
			if (typeof require < "u") return require.apply(this, arguments);
			throw Error(`Dynamic require of "${e}" is not supported`);
		});
		var P = (e, o) => () => (e && (o = e((e = 0))), o);
		var le = (e, o) => () => (o || e((o = { exports: {} }).exports, o), o.exports);
		var ue = (e, o, c, r) => {
			if ((o && typeof o === "object") || typeof o === "function")
				for (const a of ie(o))
					!se.call(e, a) &&
						a !== c &&
						W(e, a, { get: () => o[a], enumerable: !(r = ae(o, a)) || r.enumerable });
			return e;
		};
		var Ie = (e, o, c) => (
			(c = e != null ? re(ce(e)) : {}),
			ue(o || !e || !e.__esModule ? W(c, "default", { value: e, enumerable: !0 }) : c, e)
		);
		var p = P(() => {});
		var h = P(() => {});
		var f = P(() => {});
		var X = le((Q, V) => {
			p();
			h();
			f();
			(function (e) {
				if (typeof Q === "object" && typeof V < "u") V.exports = e();
				else if (typeof define === "function" && define.amd) define([], e);
				else {
					var o;
					typeof window < "u" || typeof window < "u"
						? (o = window)
						: typeof self < "u"
							? (o = self)
							: (o = this),
						(o.memoizerific = e());
				}
			})(() => {
				var _e, _o, _c;
				return (function r(a, d, s) {
					function n(i, I) {
						if (!d[i]) {
							if (!a[i]) {
								var l = typeof E === "function" && E;
								if (!I && l) return l(i, !0);
								if (t) return t(i, !0);
								var k = new Error(`Cannot find module '${i}'`);
								throw ((k.code = "MODULE_NOT_FOUND"), k);
							}
							var m = (d[i] = { exports: {} });
							a[i][0].call(
								m.exports,
								(b) => {
									var C = a[i][1][b];
									return n(C || b);
								},
								m,
								m.exports,
								r,
								a,
								d,
								s,
							);
						}
						return d[i].exports;
					}
					for (var t = typeof E === "function" && E, u = 0; u < s.length; u++) n(s[u]);
					return n;
				})(
					{
						1: [
							(r, a, _d) => {
								a.exports = (s) => {
									if (typeof Map !== "function" || s) {
										var n = r("./similar");
										return new n();
									} else return new Map();
								};
							},
							{ "./similar": 2 },
						],
						2: [
							(_r, a, _d) => {
								function s() {
									return (this.list = []), (this.lastItem = void 0), (this.size = 0), this;
								}
								(s.prototype.get = function (n) {
									var t;
									if (this.lastItem && this.isEqual(this.lastItem.key, n)) return this.lastItem.val;
									if (((t = this.indexOf(n)), t >= 0))
										return (this.lastItem = this.list[t]), this.list[t].val;
								}),
									(s.prototype.set = function (n, t) {
										var u;
										return this.lastItem && this.isEqual(this.lastItem.key, n)
											? ((this.lastItem.val = t), this)
											: ((u = this.indexOf(n)),
												u >= 0
													? ((this.lastItem = this.list[u]), (this.list[u].val = t), this)
													: ((this.lastItem = { key: n, val: t }),
														this.list.push(this.lastItem),
														this.size++,
														this));
									}),
									(s.prototype.delete = function (n) {
										var t;
										if (
											(this.lastItem &&
												this.isEqual(this.lastItem.key, n) &&
												(this.lastItem = void 0),
											(t = this.indexOf(n)),
											t >= 0)
										)
											return this.size--, this.list.splice(t, 1)[0];
									}),
									(s.prototype.has = function (n) {
										var t;
										return this.lastItem && this.isEqual(this.lastItem.key, n)
											? !0
											: ((t = this.indexOf(n)), t >= 0 ? ((this.lastItem = this.list[t]), !0) : !1);
									}),
									(s.prototype.forEach = function (n, t) {
										var u;
										for (u = 0; u < this.size; u++)
											n.call(t || this, this.list[u].val, this.list[u].key, this);
									}),
									(s.prototype.indexOf = function (n) {
										var t;
										for (t = 0; t < this.size; t++) if (this.isEqual(this.list[t].key, n)) return t;
										return -1;
									}),
									(s.prototype.isEqual = (n, t) => n === t || (n !== n && t !== t)),
									(a.exports = s);
							},
							{},
						],
						3: [
							(r, a, _d) => {
								var s = r("map-or-similar");
								a.exports = (i) => {
									var I = new s(!1),
										l = [];
									return (k) => {
										var m = function () {
											var b = I,
												C,
												R,
												O = arguments.length - 1,
												x = Array(O + 1),
												A = !0,
												T;
											if ((m.numArgs || m.numArgs === 0) && m.numArgs !== O + 1)
												throw new Error(
													"Memoizerific functions should always be called with the same number of arguments",
												);
											for (T = 0; T < O; T++) {
												if (((x[T] = { cacheItem: b, arg: arguments[T] }), b.has(arguments[T]))) {
													b = b.get(arguments[T]);
													continue;
												}
												(A = !1), (C = new s(!1)), b.set(arguments[T], C), (b = C);
											}
											return (
												A && (b.has(arguments[O]) ? (R = b.get(arguments[O])) : (A = !1)),
												A || ((R = k.apply(null, arguments)), b.set(arguments[O], R)),
												i > 0 &&
													((x[O] = { cacheItem: b, arg: arguments[O] }),
													A ? n(l, x) : l.push(x),
													l.length > i && t(l.shift())),
												(m.wasMemoized = A),
												(m.numArgs = O + 1),
												R
											);
										};
										return (m.limit = i), (m.wasMemoized = !1), (m.cache = I), (m.lru = l), m;
									};
								};
								function n(i, I) {
									var l = i.length,
										k = I.length,
										m,
										b,
										C;
									for (b = 0; b < l; b++) {
										for (m = !0, C = 0; C < k; C++)
											if (!u(i[b][C].arg, I[C].arg)) {
												m = !1;
												break;
											}
										if (m) break;
									}
									i.push(i.splice(b, 1)[0]);
								}
								function t(i) {
									var I = i.length,
										l = i[I - 1],
										k,
										m;
									for (
										l.cacheItem.delete(l.arg), m = I - 2;
										m >= 0 && ((l = i[m]), (k = l.cacheItem.get(l.arg)), !k || !k.size);
										m--
									)
										l.cacheItem.delete(l.arg);
								}
								function u(i, I) {
									return i === I || (i !== i && I !== I);
								}
							},
							{ "map-or-similar": 1 },
						],
					},
					{},
					[3],
				)(3);
			});
		});
		p();
		h();
		f();
		p();
		h();
		f();
		p();
		h();
		f();
		p();
		h();
		f();
		var g = __REACT__,
			{
				Children: Ee,
				Component: Be,
				Fragment: M,
				Profiler: we,
				PureComponent: Re,
				StrictMode: xe,
				Suspense: Le,
				__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: De,
				cloneElement: Pe,
				createContext: Me,
				createElement: Ue,
				createFactory: Ge,
				createRef: Ne,
				forwardRef: Fe,
				isValidElement: He,
				lazy: qe,
				memo: B,
				startTransition: ze,
				unstable_act: Ke,
				useCallback: U,
				useContext: Ve,
				useDebugValue: Ye,
				useDeferredValue: We,
				useEffect: je,
				useId: $e,
				useImperativeHandle: Ze,
				useInsertionEffect: Je,
				useLayoutEffect: Qe,
				useMemo: j,
				useReducer: Xe,
				useRef: eo,
				useState: G,
				useSyncExternalStore: oo,
				useTransition: to,
				version: no,
			} = __REACT__;
		p();
		h();
		f();
		var _so = __STORYBOOK_API__,
			{
				ActiveTabs: lo,
				Consumer: uo,
				ManagerContext: Io,
				Provider: mo,
				RequestResponseError: po,
				addons: N,
				combineParameters: ho,
				controlOrMetaKey: fo,
				controlOrMetaSymbol: go,
				eventMatchesShortcut: bo,
				eventToShortcut: ko,
				experimental_MockUniversalStore: Co,
				experimental_UniversalStore: _o,
				experimental_requestResponse: yo,
				experimental_useUniversalStore: So,
				isMacLike: vo,
				isShortcutTaken: Oo,
				keyToSymbol: To,
				merge: Ao,
				mockChannel: Eo,
				optionOrAltSymbol: Bo,
				shortcutMatchesShortcut: wo,
				shortcutToHumanString: Ro,
				types: $,
				useAddonState: xo,
				useArgTypes: Lo,
				useArgs: Do,
				useChannel: Po,
				useGlobalTypes: Mo,
				useGlobals: L,
				useParameter: D,
				useSharedState: Uo,
				useStoryPrepared: Go,
				useStorybookApi: No,
				useStorybookState: Fo,
			} = __STORYBOOK_API__;
		p();
		h();
		f();
		var _Vo = __STORYBOOK_COMPONENTS__,
			{
				A: Yo,
				ActionBar: Wo,
				AddonPanel: jo,
				Badge: $o,
				Bar: Zo,
				Blockquote: Jo,
				Button: Qo,
				ClipboardCode: Xo,
				Code: et,
				DL: ot,
				Div: tt,
				DocumentWrapper: nt,
				EmptyTabContent: rt,
				ErrorFormatter: at,
				FlexBar: it,
				Form: ct,
				H1: st,
				H2: lt,
				H3: ut,
				H4: It,
				H5: dt,
				H6: mt,
				HR: pt,
				IconButton: w,
				IconButtonSkeleton: ht,
				Icons: ft,
				Img: gt,
				LI: bt,
				Link: kt,
				ListItem: Ct,
				Loader: _t,
				Modal: yt,
				OL: St,
				P: vt,
				Placeholder: Ot,
				Pre: Tt,
				ProgressSpinner: At,
				ResetWrapper: Et,
				ScrollArea: Bt,
				Separator: wt,
				Spaced: Rt,
				Span: xt,
				StorybookIcon: Lt,
				StorybookLogo: Dt,
				Symbols: Pt,
				SyntaxHighlighter: Mt,
				TT: Ut,
				TabBar: Gt,
				TabButton: Nt,
				TabWrapper: Ft,
				Table: Ht,
				Tabs: qt,
				TabsState: zt,
				TooltipLinkList: F,
				TooltipMessage: Kt,
				TooltipNote: Vt,
				UL: Yt,
				WithTooltip: H,
				WithTooltipPure: Wt,
				Zoom: jt,
				codeCommon: $t,
				components: Zt,
				createCopyToClipboardFunction: Jt,
				getStoryHref: Qt,
				icons: Xt,
				interleaveSeparators: en,
				nameSpaceClassNames: on,
				resetComponents: tn,
				withReset: nn,
			} = __STORYBOOK_COMPONENTS__;
		p();
		h();
		f();
		var _ln = __STORYBOOK_ICONS__,
			{
				AccessibilityAltIcon: un,
				AccessibilityIcon: In,
				AccessibilityIgnoredIcon: dn,
				AddIcon: mn,
				AdminIcon: pn,
				AlertAltIcon: hn,
				AlertIcon: fn,
				AlignLeftIcon: gn,
				AlignRightIcon: bn,
				AppleIcon: kn,
				ArrowBottomLeftIcon: Cn,
				ArrowBottomRightIcon: _n,
				ArrowDownIcon: yn,
				ArrowLeftIcon: Sn,
				ArrowRightIcon: vn,
				ArrowSolidDownIcon: On,
				ArrowSolidLeftIcon: Tn,
				ArrowSolidRightIcon: An,
				ArrowSolidUpIcon: En,
				ArrowTopLeftIcon: Bn,
				ArrowTopRightIcon: wn,
				ArrowUpIcon: Rn,
				AzureDevOpsIcon: xn,
				BackIcon: Ln,
				BasketIcon: Dn,
				BatchAcceptIcon: Pn,
				BatchDenyIcon: Mn,
				BeakerIcon: Un,
				BellIcon: Gn,
				BitbucketIcon: Nn,
				BoldIcon: Fn,
				BookIcon: Hn,
				BookmarkHollowIcon: qn,
				BookmarkIcon: zn,
				BottomBarIcon: Kn,
				BottomBarToggleIcon: Vn,
				BoxIcon: Yn,
				BranchIcon: Wn,
				BrowserIcon: jn,
				ButtonIcon: $n,
				CPUIcon: Zn,
				CalendarIcon: Jn,
				CameraIcon: Qn,
				CameraStabilizeIcon: Xn,
				CategoryIcon: er,
				CertificateIcon: or,
				ChangedIcon: tr,
				ChatIcon: nr,
				CheckIcon: rr,
				ChevronDownIcon: ar,
				ChevronLeftIcon: ir,
				ChevronRightIcon: cr,
				ChevronSmallDownIcon: sr,
				ChevronSmallLeftIcon: lr,
				ChevronSmallRightIcon: ur,
				ChevronSmallUpIcon: Ir,
				ChevronUpIcon: dr,
				ChromaticIcon: mr,
				ChromeIcon: pr,
				CircleHollowIcon: hr,
				CircleIcon: Z,
				ClearIcon: fr,
				CloseAltIcon: gr,
				CloseIcon: br,
				CloudHollowIcon: kr,
				CloudIcon: Cr,
				CogIcon: _r,
				CollapseIcon: yr,
				CommandIcon: Sr,
				CommentAddIcon: vr,
				CommentIcon: Or,
				CommentsIcon: Tr,
				CommitIcon: Ar,
				CompassIcon: Er,
				ComponentDrivenIcon: Br,
				ComponentIcon: wr,
				ContrastIcon: Rr,
				ContrastIgnoredIcon: xr,
				ControlsIcon: Lr,
				CopyIcon: Dr,
				CreditIcon: Pr,
				CrossIcon: Mr,
				DashboardIcon: Ur,
				DatabaseIcon: Gr,
				DeleteIcon: Nr,
				DiamondIcon: Fr,
				DirectionIcon: Hr,
				DiscordIcon: qr,
				DocChartIcon: zr,
				DocListIcon: Kr,
				DocumentIcon: Vr,
				DownloadIcon: Yr,
				DragIcon: Wr,
				EditIcon: jr,
				EllipsisIcon: $r,
				EmailIcon: Zr,
				ExpandAltIcon: Jr,
				ExpandIcon: Qr,
				EyeCloseIcon: Xr,
				EyeIcon: ea,
				FaceHappyIcon: oa,
				FaceNeutralIcon: ta,
				FaceSadIcon: na,
				FacebookIcon: ra,
				FailedIcon: aa,
				FastForwardIcon: ia,
				FigmaIcon: ca,
				FilterIcon: sa,
				FlagIcon: la,
				FolderIcon: ua,
				FormIcon: Ia,
				GDriveIcon: da,
				GithubIcon: ma,
				GitlabIcon: pa,
				GlobeIcon: ha,
				GoogleIcon: fa,
				GraphBarIcon: ga,
				GraphLineIcon: ba,
				GraphqlIcon: ka,
				GridAltIcon: Ca,
				GridIcon: q,
				GrowIcon: _a,
				HeartHollowIcon: ya,
				HeartIcon: Sa,
				HomeIcon: va,
				HourglassIcon: Oa,
				InfoIcon: Ta,
				ItalicIcon: Aa,
				JumpToIcon: Ea,
				KeyIcon: Ba,
				LightningIcon: wa,
				LightningOffIcon: Ra,
				LinkBrokenIcon: xa,
				LinkIcon: La,
				LinkedinIcon: Da,
				LinuxIcon: Pa,
				ListOrderedIcon: Ma,
				ListUnorderedIcon: Ua,
				LocationIcon: Ga,
				LockIcon: Na,
				MarkdownIcon: Fa,
				MarkupIcon: Ha,
				MediumIcon: qa,
				MemoryIcon: za,
				MenuIcon: Ka,
				MergeIcon: Va,
				MirrorIcon: Ya,
				MobileIcon: Wa,
				MoonIcon: ja,
				NutIcon: $a,
				OutboxIcon: Za,
				OutlineIcon: Ja,
				PaintBrushIcon: Qa,
				PaperClipIcon: Xa,
				ParagraphIcon: ei,
				PassedIcon: oi,
				PhoneIcon: ti,
				PhotoDragIcon: ni,
				PhotoIcon: z,
				PhotoStabilizeIcon: ri,
				PinAltIcon: ai,
				PinIcon: ii,
				PlayAllHollowIcon: ci,
				PlayBackIcon: si,
				PlayHollowIcon: li,
				PlayIcon: ui,
				PlayNextIcon: Ii,
				PlusIcon: di,
				PointerDefaultIcon: mi,
				PointerHandIcon: pi,
				PowerIcon: hi,
				PrintIcon: fi,
				ProceedIcon: gi,
				ProfileIcon: bi,
				PullRequestIcon: ki,
				QuestionIcon: Ci,
				RSSIcon: _i,
				RedirectIcon: yi,
				ReduxIcon: Si,
				RefreshIcon: J,
				ReplyIcon: vi,
				RepoIcon: Oi,
				RequestChangeIcon: Ti,
				RewindIcon: Ai,
				RulerIcon: Ei,
				SaveIcon: Bi,
				SearchIcon: wi,
				ShareAltIcon: Ri,
				ShareIcon: xi,
				ShieldIcon: Li,
				SideBySideIcon: Di,
				SidebarAltIcon: Pi,
				SidebarAltToggleIcon: Mi,
				SidebarIcon: Ui,
				SidebarToggleIcon: Gi,
				SpeakerIcon: Ni,
				StackedIcon: Fi,
				StarHollowIcon: Hi,
				StarIcon: qi,
				StatusFailIcon: zi,
				StatusIcon: Ki,
				StatusPassIcon: Vi,
				StatusWarnIcon: Yi,
				StickerIcon: Wi,
				StopAltHollowIcon: ji,
				StopAltIcon: $i,
				StopIcon: Zi,
				StorybookIcon: Ji,
				StructureIcon: Qi,
				SubtractIcon: Xi,
				SunIcon: ec,
				SupportIcon: oc,
				SweepIcon: tc,
				SwitchAltIcon: nc,
				SyncIcon: rc,
				TabletIcon: ac,
				ThumbsUpIcon: ic,
				TimeIcon: cc,
				TimerIcon: sc,
				TransferIcon: lc,
				TrashIcon: uc,
				TwitterIcon: Ic,
				TypeIcon: dc,
				UbuntuIcon: mc,
				UndoIcon: pc,
				UnfoldIcon: hc,
				UnlockIcon: fc,
				UnpinIcon: gc,
				UploadIcon: bc,
				UserAddIcon: kc,
				UserAltIcon: Cc,
				UserIcon: _c,
				UsersIcon: yc,
				VSCodeIcon: Sc,
				VerifiedIcon: vc,
				VideoIcon: Oc,
				WandIcon: Tc,
				WatchIcon: Ac,
				WindowsIcon: Ec,
				WrenchIcon: Bc,
				XIcon: wc,
				YoutubeIcon: Rc,
				ZoomIcon: xc,
				ZoomOutIcon: Lc,
				ZoomResetIcon: Dc,
				iconList: Pc,
			} = __STORYBOOK_ICONS__;
		p();
		h();
		f();
		var _Fc = __STORYBOOK_CLIENT_LOGGER__,
			{ deprecate: Hc, logger: K, once: qc, pretty: zc } = __STORYBOOK_CLIENT_LOGGER__;
		var Y = Ie(X());
		p();
		h();
		f();
		var _Qc = __STORYBOOK_THEMING__,
			{
				CacheProvider: Xc,
				ClassNames: es,
				Global: os,
				ThemeProvider: ts,
				background: ns,
				color: rs,
				convert: as,
				create: is,
				createCache: cs,
				createGlobal: ss,
				createReset: ls,
				css: us,
				darken: Is,
				ensure: ds,
				ignoreSsrWarning: ms,
				isPropValid: ps,
				jsx: hs,
				keyframes: fs,
				lighten: gs,
				styled: ee,
				themes: bs,
				typography: ks,
				useTheme: Cs,
				withTheme: _s,
			} = __STORYBOOK_THEMING__;
		p();
		h();
		f();
		function oe(e) {
			for (var o = [], c = 1; c < arguments.length; c++) o[c - 1] = arguments[c];
			var r = Array.from(typeof e === "string" ? [e] : e);
			r[r.length - 1] = r[r.length - 1].replace(/\r?\n([\t ]*)$/, "");
			var a = r.reduce((n, t) => {
				var u = t.match(/\n([\t ]+|(?!\s).)/g);
				return u
					? n.concat(
							u.map((i) => {
								var I, l;
								return (l =
									(I = i.match(/[\t ]/g)) === null || I === void 0 ? void 0 : I.length) !== null &&
									l !== void 0
									? l
									: 0;
							}),
						)
					: n;
			}, []);
			if (a.length) {
				var d = new RegExp(
					`
[	 ]{` +
						Math.min.apply(Math, a) +
						"}",
					"g",
				);
				r = r.map((n) =>
					n.replace(
						d,
						`
`,
					),
				);
			}
			r[0] = r[0].replace(/^\r?\n/, "");
			var s = r[0];
			return (
				o.forEach((n, t) => {
					var u = s.match(/(?:^|\n)( *)$/),
						i = u ? u[1] : "",
						I = n;
					typeof n === "string" &&
						n.includes(`
`) &&
						(I = String(n)
							.split(`
`)
							.map((l, k) => (k === 0 ? l : `${i}${l}`))
							.join(`
`)),
						(s += I + r[t + 1]);
				}),
				s
			);
		}
		var te = "storybook/background",
			_ = "backgrounds",
			de = { light: { name: "light", value: "#F8F8F8" }, dark: { name: "dark", value: "#333" } },
			me = B(() => {
				const e = D(_),
					[o, c, r] = L(),
					[a, d] = G(!1),
					{ options: s = de, disable: n = !0 } = e || {};
				if (n) return null;
				const t = o[_] || {},
					u = t.value,
					i = t.grid || !1,
					I = s[u],
					l = !!r?.[_],
					k = Object.keys(s).length;
				return g.createElement(pe, {
					length: k,
					backgroundMap: s,
					item: I,
					updateGlobals: c,
					backgroundName: u,
					setIsTooltipVisible: d,
					isLocked: l,
					isGridActive: i,
					isTooltipVisible: a,
				});
			}),
			pe = B((e) => {
				const {
						item: o,
						length: c,
						updateGlobals: r,
						setIsTooltipVisible: a,
						backgroundMap: d,
						backgroundName: s,
						isLocked: n,
						isGridActive: t,
						isTooltipVisible: u,
					} = e,
					i = U(
						(I) => {
							r({ [_]: I });
						},
						[r],
					);
				return g.createElement(
					M,
					null,
					g.createElement(
						w,
						{
							key: "grid",
							active: t,
							disabled: n,
							title: "Apply a grid to the preview",
							onClick: () => i({ value: s, grid: !t }),
						},
						g.createElement(q, null),
					),
					c > 0
						? g.createElement(
								H,
								{
									key: "background",
									placement: "top",
									closeOnOutsideClick: !0,
									tooltip: ({ onHide: I }) =>
										g.createElement(F, {
											links: [
												...(o
													? [
															{
																id: "reset",
																title: "Reset background",
																icon: g.createElement(J, null),
																onClick: () => {
																	i({ value: void 0, grid: t }), I();
																},
															},
														]
													: []),
												...Object.entries(d).map(([l, k]) => ({
													id: l,
													title: k.name,
													icon: g.createElement(Z, { color: k?.value || "grey" }),
													active: l === s,
													onClick: () => {
														i({ value: l, grid: t }), I();
													},
												})),
											].flat(),
										}),
									onVisibleChange: a,
								},
								g.createElement(
									w,
									{
										disabled: n,
										key: "background",
										title: "Change the background of the preview",
										active: !!o || u,
									},
									g.createElement(z, null),
								),
							)
						: null,
				);
			}),
			he = ee.span(
				({ background: e }) => ({
					borderRadius: "1rem",
					display: "block",
					height: "1rem",
					width: "1rem",
					background: e,
				}),
				({ theme: e }) => ({ boxShadow: `${e.appBorderColor} 0 0 0 1px inset` }),
			),
			fe = (e, o = [], c) => {
				if (e === "transparent") return "transparent";
				if (o.find((a) => a.value === e) || e) return e;
				const r = o.find((a) => a.name === c);
				if (r) return r.value;
				if (c) {
					const a = o.map((d) => d.name).join(", ");
					K.warn(oe`
        Backgrounds Addon: could not find the default color "${c}".
        These are the available colors for your story based on your configuration:
        ${a}.
      `);
				}
				return "transparent";
			},
			ne = (0, Y.default)(1e3)((e, o, c, r, a, d) => ({
				id: e || o,
				title: o,
				onClick: () => {
					a({ selected: c, name: o });
				},
				value: c,
				right: r ? g.createElement(he, { background: c }) : void 0,
				active: d,
			})),
			ge = (0, Y.default)(10)((e, o, c) => {
				const r = e.map(({ name: a, value: d }) => ne(null, a, d, !0, c, d === o));
				return o !== "transparent"
					? [ne("reset", "Clear background", "transparent", null, c, !1), ...r]
					: r;
			}),
			be = { default: null, disable: !0, values: [] },
			ke = B(() => {
				const e = D(_, be),
					[o, c] = G(!1),
					[r, a] = L(),
					d = r[_]?.value,
					s = j(() => fe(d, e.values, e.default), [e, d]);
				Array.isArray(e) &&
					K.warn(
						"Addon Backgrounds api has changed in Storybook 6.0. Please refer to the migration guide: https://github.com/storybookjs/storybook/blob/next/MIGRATION.md",
					);
				const n = U(
					(t) => {
						a({ [_]: { ...r[_], value: t } });
					},
					[e, r, a],
				);
				return e.disable
					? null
					: g.createElement(
							H,
							{
								placement: "top",
								closeOnOutsideClick: !0,
								tooltip: ({ onHide: t }) =>
									g.createElement(F, {
										links: ge(e.values, s, ({ selected: u }) => {
											s !== u && n(u), t();
										}),
									}),
								onVisibleChange: c,
							},
							g.createElement(
								w,
								{
									key: "background",
									title: "Change the background of the preview",
									active: s !== "transparent" || o,
								},
								g.createElement(z, null),
							),
						);
			}),
			Ce = B(() => {
				const [e, o] = L(),
					{ grid: c } = D(_, { grid: { disable: !1 } });
				if (c?.disable) return null;
				const r = e[_]?.grid || !1;
				return g.createElement(
					w,
					{
						key: "background",
						active: r,
						title: "Apply a grid to the preview",
						onClick: () => o({ [_]: { ...e[_], grid: !r } }),
					},
					g.createElement(q, null),
				);
			});
		N.register(te, () => {
			N.add(te, {
				title: "Backgrounds",
				type: $.TOOL,
				match: ({ viewMode: e, tabId: o }) => !!e?.match(/^(story|docs)$/) && !o,
				render: () =>
					FEATURES?.backgroundsStoryGlobals
						? g.createElement(me, null)
						: g.createElement(M, null, g.createElement(ke, null), g.createElement(Ce, null)),
			});
		});
	})();
} catch (e) {
	console.error(`[Storybook] One of your manager-entries failed: ${import.meta.url}`, e);
}
