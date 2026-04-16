"use client";

/**
 * AI Selector Component
 *
 * Command palette for AI text generation.
 */

import { useCompletion } from "@repo/ai/client";
import { Button, Command, CommandInput, CommandList, ScrollArea, Spinner } from "@repo/ui";
import type { Editor } from "@tiptap/react";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import { AICompletionCommands } from "./completion-commands";
import { AISelectorCommands } from "./selector-commands";

type AiSelectorProps = {
	readonly editor: Editor;
	readonly onOpenChange: (open: boolean) => void;
	/** API endpoint for AI completions (default: /api/editor/generate) */
	readonly apiEndpoint?: string;
};

/**
 * Get previous text from editor for context
 */
function getPrevText(editor: Editor, pos: number, maxChars = 5000): string {
	const doc = editor.state.doc;
	const from = Math.max(0, pos - maxChars);
	return doc.textBetween(from, pos, "\n");
}

export const AISelector = ({
	editor,
	onOpenChange,
	apiEndpoint = "/api/editor/generate",
}: AiSelectorProps) => {
	const [inputValue, setInputValue] = useState("");

	const { completion, complete, isLoading } = useCompletion({
		api: apiEndpoint,
		onError: (error) => {
			console.error("AI completion error:", error);
		},
	});

	const hasCompletion = completion.length > 0;

	const handleAppend = async () => {
		const pos = editor.state.selection.from;
		const context = getPrevText(editor, pos);
		const slice = editor.state.selection.content();
		const text = slice.content.textBetween(0, slice.content.size, "\n");
		const selection = completion === "" ? text : completion;

		await complete(
			[
				`Here is the selected text: ${selection}`,
				`Here are the last 5000 characters for context: ${context}`,
			].join("\n"),
			{
				body: { option: "zap", command: inputValue },
			},
		);
		setInputValue("");
	};

	return (
		<Command className="w-[350px]">
			{hasCompletion ? (
				<div className="flex max-h-[400px]">
					<ScrollArea>
						<div className="prose prose-sm px-4 py-2">
							<Markdown>{completion}</Markdown>
						</div>
					</ScrollArea>
				</div>
			) : null}

			{isLoading ? (
				<div className="flex h-12 w-full items-center justify-center">
					<Spinner />
				</div>
			) : (
				<>
					<div className="relative">
						<CommandInput
							autoFocus
							onFocus={() => {
								editor.chain().setHighlight({ color: "#c1ecf970" }).run();
							}}
							onValueChange={setInputValue}
							placeholder={
								hasCompletion ? "Tell AI what to do next" : "Ask AI to edit or generate..."
							}
							value={inputValue}
						/>
						<Button
							className="-translate-y-1/2 absolute top-1/2 right-2 h-6 w-6 bg-violet-500 dark:bg-violet-400"
							onClick={handleAppend}
							size="icon"
						>
							<ArrowUp className="h-3 w-3" />
						</Button>
					</div>
					<CommandList>
						{hasCompletion ? (
							<AICompletionCommands
								editor={editor}
								completion={completion}
								onDiscard={() => {
									onOpenChange(false);
								}}
							/>
						) : (
							<AISelectorCommands editor={editor} onSelect={complete} />
						)}
					</CommandList>
				</>
			)}
		</Command>
	);
};
