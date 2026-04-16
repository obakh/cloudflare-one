/**
 * Emoji Plugin
 *
 * Emoji suggestions with `:` trigger.
 * Note: This is a simplified version. For full emoji support,
 * consider using @tiptap-pro/extension-emoji (requires license).
 */

import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions } from "@tiptap/suggestion";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { EmojiList, type EmojiListRef } from "./emoji-list";

// Common emojis for basic support
export const commonEmojis = [
	{ name: "smile", emoji: "😊", shortcodes: ["smile", "happy"] },
	{ name: "thumbsup", emoji: "👍", shortcodes: ["thumbsup", "+1", "like"] },
	{ name: "heart", emoji: "❤️", shortcodes: ["heart", "love"] },
	{ name: "fire", emoji: "🔥", shortcodes: ["fire", "hot"] },
	{ name: "rocket", emoji: "🚀", shortcodes: ["rocket", "launch"] },
	{ name: "check", emoji: "✅", shortcodes: ["check", "done"] },
	{ name: "x", emoji: "❌", shortcodes: ["x", "no", "cross"] },
	{ name: "star", emoji: "⭐", shortcodes: ["star"] },
	{ name: "bulb", emoji: "💡", shortcodes: ["bulb", "idea", "tip"] },
	{ name: "eyes", emoji: "👀", shortcodes: ["eyes", "look"] },
	{ name: "thought_balloon", emoji: "💭", shortcodes: ["thought_balloon", "thinking"] },
	{ name: "airplane_departure", emoji: "🛫", shortcodes: ["airplane_departure", "takeoff"] },
	{ name: "warning", emoji: "⚠️", shortcodes: ["warning", "alert"] },
	{ name: "info", emoji: "ℹ️", shortcodes: ["info", "information"] },
	{ name: "question", emoji: "❓", shortcodes: ["question"] },
	{ name: "exclamation", emoji: "❗", shortcodes: ["exclamation"] },
	{ name: "party", emoji: "🎉", shortcodes: ["party", "tada", "celebrate"] },
	{ name: "clap", emoji: "👏", shortcodes: ["clap", "applause"] },
	{ name: "wave", emoji: "👋", shortcodes: ["wave", "hi", "hello"] },
	{ name: "pray", emoji: "🙏", shortcodes: ["pray", "thanks", "please"] },
];

export type EmojiItem = {
	name: string;
	emoji: string;
	shortcodes: string[];
	fallbackImage?: string;
};

export const emojiSuggestion: Partial<SuggestionOptions<EmojiItem>> = {
	char: ":",
	items: ({ query }) =>
		commonEmojis
			.filter(
				({ shortcodes, name }) =>
					shortcodes.some((shortcode) => shortcode.toLowerCase().startsWith(query.toLowerCase())) ||
					name.toLowerCase().startsWith(query.toLowerCase()),
			)
			.slice(0, 5),

	allowSpaces: false,

	render: () => {
		let component: ReactRenderer<EmojiListRef> | null = null;
		let popup: TippyInstance[] | null = null;

		return {
			onStart: (props) => {
				component = new ReactRenderer(EmojiList, {
					props,
					editor: props.editor,
				});

				if (!props.clientRect) return;

				popup = tippy("body", {
					getReferenceClientRect: props.clientRect as () => DOMRect,
					appendTo: () => document.body,
					content: component.element,
					showOnCreate: true,
					interactive: true,
					trigger: "manual",
					placement: "bottom-start",
				});
			},

			onUpdate(props) {
				component?.updateProps(props);

				if (!props.clientRect) return;

				popup?.[0]?.setProps({
					getReferenceClientRect: props.clientRect as () => DOMRect,
				});
			},

			onKeyDown(props) {
				if (props.event.key === "Escape") {
					popup?.[0]?.hide();
					component?.destroy();
					return true;
				}

				return component?.ref?.onKeyDown(props) ?? false;
			},

			onExit() {
				popup?.[0]?.destroy();
				component?.destroy();
			},
		};
	},
};
