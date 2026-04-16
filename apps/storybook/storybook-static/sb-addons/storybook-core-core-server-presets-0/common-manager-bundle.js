try {
	(() => {
		var _S = __STORYBOOK_API__,
			{
				ActiveTabs: g,
				Consumer: v,
				ManagerContext: D,
				Provider: T,
				RequestResponseError: h,
				addons: a,
				combineParameters: C,
				controlOrMetaKey: U,
				controlOrMetaSymbol: f,
				eventMatchesShortcut: A,
				eventToShortcut: x,
				experimental_MockUniversalStore: P,
				experimental_UniversalStore: M,
				experimental_requestResponse: R,
				experimental_useUniversalStore: w,
				isMacLike: B,
				isShortcutTaken: E,
				keyToSymbol: I,
				merge: K,
				mockChannel: N,
				optionOrAltSymbol: G,
				shortcutMatchesShortcut: L,
				shortcutToHumanString: Y,
				types: q,
				useAddonState: F,
				useArgTypes: H,
				useArgs: j,
				useChannel: V,
				useGlobalTypes: z,
				useGlobals: J,
				useParameter: Q,
				useSharedState: W,
				useStoryPrepared: X,
				useStorybookApi: Z,
				useStorybookState: $,
			} = __STORYBOOK_API__;
		var u = (() => {
				let e;
				return (
					typeof window < "u"
						? (e = window)
						: typeof globalThis < "u"
							? (e = globalThis)
							: typeof window < "u"
								? (e = window)
								: typeof self < "u"
									? (e = self)
									: (e = {}),
					e
				);
			})(),
			d = "tag-filters",
			i = "static-filter";
		a.register(d, (e) => {
			const p = Object.entries(u.TAGS_OPTIONS ?? {}).reduce((o, r) => {
				const [t, m] = r;
				return m.excludeFromSidebar && (o[t] = !0), o;
			}, {});
			e.experimental_setFilter(i, (o) => {
				const r = o.tags ?? [];
				return (r.includes("dev") || o.type === "docs") && r.filter((t) => p[t]).length === 0;
			});
		});
	})();
} catch (e) {
	console.error(`[Storybook] One of your manager-entries failed: ${import.meta.url}`, e);
}
