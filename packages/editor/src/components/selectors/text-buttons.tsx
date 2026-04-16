"use client";

/**
 * Text Buttons
 *
 * Quick action buttons for text manipulation.
 */

import { Button, cn } from "@repo/ui";
import type { Editor } from "@tiptap/react";
import { RemoveFormattingIcon } from "lucide-react";
import type { SelectorItem } from "./node-selector";

type TextButtonsProps = {
	readonly editor: Editor;
};

export const TextButtons = ({ editor }: TextButtonsProps) => {
	const items: SelectorItem[] = [
		{
			name: "clear-formatting",
			isActive: () => false,
			command: (ed) => ed.chain().focus().clearNodes().unsetAllMarks().run(),
			icon: RemoveFormattingIcon,
		},
	];

	return (
		<div className="flex">
			{items.map((item) => (
				<Button
					key={item.name}
					className="rounded-none"
					size="icon"
					variant="ghost"
					onClick={() => item.command(editor)}
				>
					<item.icon
						className={cn("h-4 w-4", {
							"text-violet-500 dark:text-violet-400": item.isActive(editor),
						})}
					/>
				</Button>
			))}
		</div>
	);
};
