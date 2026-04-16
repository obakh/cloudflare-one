"use client";

/**
 * AI Completion Commands
 *
 * Actions to take after AI generates content.
 */

import { CommandGroup, CommandItem, CommandSeparator } from "@repo/ui";
import type { Editor } from "@tiptap/react";
import { Check, TextQuote, TrashIcon } from "lucide-react";

type AICompletionCommandsProps = {
	readonly editor: Editor;
	readonly completion: string;
	readonly onDiscard: () => void;
};

export const AICompletionCommands = ({
	editor,
	completion,
	onDiscard,
}: AICompletionCommandsProps) => {
	const handleReplace = () => {
		const { selection } = editor.view.state;

		editor
			.chain()
			.focus()
			.unsetAllMarks()
			.insertContentAt(
				{
					from: selection.from,
					to: selection.to,
				},
				completion,
			)
			.run();
	};

	const handleInsert = () => {
		const { selection } = editor.view.state;
		editor
			.chain()
			.focus()
			.unsetAllMarks()
			.insertContentAt(selection.to + 1, completion)
			.run();
	};

	return (
		<>
			<CommandGroup>
				<CommandItem className="gap-2 px-4" onSelect={handleReplace} value="replace">
					<Check className="h-4 w-4 text-muted-foreground" />
					Replace selection
				</CommandItem>
				<CommandItem className="gap-2 px-4" onSelect={handleInsert} value="insert">
					<TextQuote className="h-4 w-4 text-muted-foreground" />
					Insert below
				</CommandItem>
			</CommandGroup>
			<CommandSeparator />

			<CommandGroup>
				<CommandItem className="gap-2 px-4" onSelect={onDiscard} value="thrash">
					<TrashIcon className="h-4 w-4 text-muted-foreground" />
					Discard
				</CommandItem>
			</CommandGroup>
		</>
	);
};
