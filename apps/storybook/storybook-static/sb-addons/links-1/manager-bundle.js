try {
	(() => {
		var _k = __STORYBOOK_API__,
			{
				ActiveTabs: y,
				Consumer: O,
				ManagerContext: S,
				Provider: D,
				RequestResponseError: v,
				addons: n,
				combineParameters: g,
				controlOrMetaKey: C,
				controlOrMetaSymbol: E,
				eventMatchesShortcut: U,
				eventToShortcut: T,
				experimental_MockUniversalStore: A,
				experimental_UniversalStore: h,
				experimental_requestResponse: R,
				experimental_useUniversalStore: I,
				isMacLike: P,
				isShortcutTaken: x,
				keyToSymbol: M,
				merge: N,
				mockChannel: B,
				optionOrAltSymbol: K,
				shortcutMatchesShortcut: V,
				shortcutToHumanString: f,
				types: q,
				useAddonState: G,
				useArgTypes: L,
				useArgs: Y,
				useChannel: $,
				useGlobalTypes: H,
				useGlobals: Q,
				useParameter: j,
				useSharedState: w,
				useStoryPrepared: z,
				useStorybookApi: F,
				useStorybookState: J,
			} = __STORYBOOK_API__;
		var e = "storybook/links",
			m = { NAVIGATE: `${e}/navigate`, REQUEST: `${e}/request`, RECEIVE: `${e}/receive` };
		n.register(e, (o) => {
			o.on(m.REQUEST, ({ kind: a, name: p }) => {
				const u = o.storyId(a, p);
				o.emit(m.RECEIVE, u);
			});
		});
	})();
} catch (e) {
	console.error(`[Storybook] One of your manager-entries failed: ${import.meta.url}`, e);
}
