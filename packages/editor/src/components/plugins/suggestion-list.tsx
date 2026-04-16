"use client";

/**
 * Suggestion List Component
 *
 * Reusable list for emoji, mention, and other suggestions.
 */

import { cn } from "@repo/ui";
import type { ReactNode } from "react";

export type SuggestionListProps<T> = {
	readonly items: T[];
	readonly selected: number;
	readonly onSelect: (index: number) => void;
	readonly render?: (item: T) => ReactNode;
};

const itemClassName = cn(
	"flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm",
	"text-foreground",
);

export function SuggestionList<T>({ selected, onSelect, items, render }: SuggestionListProps<T>) {
	return (
		<div className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border bg-background/90 p-1 shadow-md backdrop-blur-sm transition-all">
			{items.length > 0 ? (
				items.map((item, index) => (
					<button
						className={cn(
							itemClassName,
							index === selected && "bg-card text-foreground",
							"hover:bg-card",
						)}
						key={index}
						onClick={() => onSelect(index)}
						type="button"
					>
						{render ? render(item) : String(item)}
					</button>
				))
			) : (
				<div className={itemClassName}>No results found</div>
			)}
		</div>
	);
}
