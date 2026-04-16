"use client";

/**
 * AI Plugin
 *
 * AI-powered text generation and editing in the bubble menu.
 */

import { Button } from "@repo/ui";
import { BubbleMenu, type Editor } from "@tiptap/react";
import { SparklesIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AISelector } from "./ai-selector";

type GenerativeMenuSwitchProps = {
	readonly editor: Editor;
	readonly children: ReactNode;
	readonly open: boolean;
	readonly onOpenChange: (open: boolean) => void;
};

export const GenerativeMenuSwitch = ({
	editor,
	children,
	open,
	onOpenChange,
}: GenerativeMenuSwitchProps) => {
	return (
		<BubbleMenu
			editor={editor}
			tippyOptions={{
				appendTo: () => document.body,
				placement: open ? "bottom-start" : "top",
				onHidden: () => {
					onOpenChange(false);
				},
			}}
			className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-border/50 bg-background/90 shadow-xl backdrop-blur-lg"
		>
			{open ? (
				<AISelector editor={editor} onOpenChange={onOpenChange} />
			) : (
				<>
					<Button
						className="gap-1 rounded-none text-violet-500 dark:text-violet-400"
						onClick={() => onOpenChange(true)}
						variant="ghost"
					>
						<SparklesIcon className="h-5 w-5" />
						Ask AI
					</Button>
					{children}
				</>
			)}
		</BubbleMenu>
	);
};

export { AISelector } from "./ai-selector";
export { AICompletionCommands } from "./completion-commands";
export { AISelectorCommands } from "./selector-commands";
