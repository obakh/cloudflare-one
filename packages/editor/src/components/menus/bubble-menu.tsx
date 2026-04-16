"use client";

/**
 * Bubble Menu
 *
 * Floating toolbar that appears when text is selected.
 */

import { Separator } from "@repo/ui";
import type { Editor } from "@tiptap/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { GenerativeMenuSwitch } from "../plugins/ai";
import { FormatSelector } from "../selectors/format-selector";
import { LinkSelector } from "../selectors/link-selector";
import { NodeSelector } from "../selectors/node-selector";
import { TextButtons } from "../selectors/text-buttons";

type BubbleMenuProps = {
	readonly editor: Editor;
	readonly children?: ReactNode;
	/** Enable AI features (requires API endpoint) */
	readonly enableAI?: boolean;
};

export const BubbleMenu = ({ editor, children, enableAI = true }: BubbleMenuProps) => {
	const [openNode, setOpenNode] = useState(false);
	const [openLink, setOpenLink] = useState(false);
	const [openFormat, setOpenFormat] = useState(false);
	const [openAi, setOpenAi] = useState(false);

	if (!enableAI) {
		// Simple bubble menu without AI
		return (
			<div className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-border/50 bg-background/90 shadow-xl backdrop-blur-lg">
				<NodeSelector editor={editor} open={openNode} onOpenChange={setOpenNode} />
				<FormatSelector editor={editor} open={openFormat} onOpenChange={setOpenFormat} />
				<Separator orientation="vertical" />
				<LinkSelector editor={editor} open={openLink} onOpenChange={setOpenLink} />
				<Separator orientation="vertical" />
				<TextButtons editor={editor} />
				{children}
			</div>
		);
	}

	return (
		<GenerativeMenuSwitch editor={editor} onOpenChange={setOpenAi} open={openAi}>
			<Separator orientation="vertical" />
			<NodeSelector editor={editor} open={openNode} onOpenChange={setOpenNode} />
			<FormatSelector editor={editor} open={openFormat} onOpenChange={setOpenFormat} />
			<Separator orientation="vertical" />
			<LinkSelector editor={editor} open={openLink} onOpenChange={setOpenLink} />
			<Separator orientation="vertical" />
			<TextButtons editor={editor} />
			{children}
		</GenerativeMenuSwitch>
	);
};
