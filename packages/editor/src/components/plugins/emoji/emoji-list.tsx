"use client";

/**
 * Emoji List Component
 */

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { SuggestionList } from "../suggestion-list";
import type { EmojiItem } from "./index";

export type EmojiListRef = {
	onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

type EmojiListProps = {
	items: EmojiItem[];
	command: (props: { name: string }) => void;
};

export const EmojiList = forwardRef<EmojiListRef, EmojiListProps>((props, ref) => {
	const [selectedIndex, setSelectedIndex] = useState(0);

	const selectItem = (index: number) => {
		const item = props.items[index];

		if (item) {
			props.command({ name: item.name });
		}
	};

	const upHandler = () => {
		setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
	};

	const downHandler = () => {
		setSelectedIndex((selectedIndex + 1) % props.items.length);
	};

	const enterHandler = () => {
		selectItem(selectedIndex);
	};

	useEffect(() => setSelectedIndex(0), [props.items]);

	useImperativeHandle(ref, () => ({
		onKeyDown: (x) => {
			if (x.event.key === "ArrowUp") {
				upHandler();
				return true;
			}

			if (x.event.key === "ArrowDown") {
				downHandler();
				return true;
			}

			if (x.event.key === "Enter") {
				enterHandler();
				return true;
			}

			return false;
		},
	}));

	return (
		<SuggestionList
			items={props.items}
			onSelect={selectItem}
			render={(item) => (
				<div className="flex items-center gap-1">
					{item.fallbackImage ? (
						<img className="h-4 align-middle" src={item.fallbackImage} alt={item.name} />
					) : (
						item.emoji
					)}
					:{item.name}:
				</div>
			)}
			selected={selectedIndex}
		/>
	);
});

EmojiList.displayName = "EmojiList";
