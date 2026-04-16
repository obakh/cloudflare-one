"use client";

/**
 * AI Selector Commands
 *
 * Options for AI text manipulation.
 */

import { CommandGroup, CommandItem, CommandSeparator } from "@repo/ui";
import type { Editor } from "@tiptap/react";
import {
	ArrowDownWideNarrow,
	CheckCheck,
	RefreshCcwDot,
	StepForward,
	WrapText,
} from "lucide-react";

const options = [
	{
		value: "improve",
		label: "Improve writing",
		icon: RefreshCcwDot,
	},
	{
		value: "fix",
		label: "Fix grammar",
		icon: CheckCheck,
	},
	{
		value: "shorter",
		label: "Make shorter",
		icon: ArrowDownWideNarrow,
	},
	{
		value: "longer",
		label: "Make longer",
		icon: WrapText,
	},
];

type AiSelectorCommandsProps = {
	readonly editor: Editor;
	readonly onSelect: (value: string, options?: { body: { option: string } }) => void;
};

/**
 * Get previous text from editor for context
 */
function getPrevText(editor: Editor, pos: number, maxChars = 5000): string {
	const doc = editor.state.doc;
	const from = Math.max(0, pos - maxChars);
	return doc.textBetween(from, pos, "\n");
}

export const AISelectorCommands = ({ editor, onSelect }: AiSelectorCommandsProps) => {
	const handleSelect = (value: string) => {
		const slice = editor.state.selection.content();
		const text = slice.content.textBetween(0, slice.content.size, "\n");

		onSelect(text, { body: { option: value } });
	};

	return (
		<>
			<CommandGroup heading="Edit or review selection">
				{options.map((option) => (
					<CommandItem
						className="flex gap-2 px-4"
						key={option.value}
						onSelect={() => handleSelect(option.value)}
						value={option.value}
					>
						<option.icon className="h-4 w-4 text-violet-500 dark:text-violet-400" />
						{option.label}
					</CommandItem>
				))}
			</CommandGroup>
			<CommandSeparator />
			<CommandGroup heading="Use AI to do more">
				<CommandItem
					className="gap-2 px-4"
					onSelect={() => {
						const pos = editor.state.selection.from;
						const context = getPrevText(editor, pos);
						onSelect(context, { body: { option: "continue" } });
					}}
					value="continue"
				>
					<StepForward className="h-4 w-4 text-violet-500 dark:text-violet-400" />
					Continue writing
				</CommandItem>
			</CommandGroup>
		</>
	);
};

export default AISelectorCommands;
