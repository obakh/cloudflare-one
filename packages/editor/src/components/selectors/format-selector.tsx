"use client";

/**
 * Format Selector
 *
 * Dropdown for text formatting (bold, italic, underline, etc.)
 */

import { Button, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import type { Editor } from "@tiptap/react";
import type { LucideIcon } from "lucide-react";
import {
	BoldIcon,
	Check,
	ChevronDown,
	CodeIcon,
	ItalicIcon,
	StrikethroughIcon,
	SubscriptIcon,
	SuperscriptIcon,
	UnderlineIcon,
} from "lucide-react";

export type FormatItem = {
	name: string;
	icon: LucideIcon;
	command: (editor: Editor) => void;
	isActive: (editor: Editor) => boolean;
};

const items: FormatItem[] = [
	{
		name: "Bold",
		isActive: (editor) => editor.isActive("bold"),
		command: (editor) => editor.chain().focus().toggleBold().run(),
		icon: BoldIcon,
	},
	{
		name: "Italic",
		isActive: (editor) => editor.isActive("italic"),
		command: (editor) => editor.chain().focus().toggleItalic().run(),
		icon: ItalicIcon,
	},
	{
		name: "Underline",
		isActive: (editor) => editor.isActive("underline"),
		command: (editor) => editor.chain().focus().toggleUnderline().run(),
		icon: UnderlineIcon,
	},
	{
		name: "Strikethrough",
		isActive: (editor) => editor.isActive("strike"),
		command: (editor) => editor.chain().focus().toggleStrike().run(),
		icon: StrikethroughIcon,
	},
	{
		name: "Code",
		isActive: (editor) => editor.isActive("code"),
		command: (editor) => editor.chain().focus().toggleCode().run(),
		icon: CodeIcon,
	},
	{
		name: "Superscript",
		isActive: (editor) => editor.isActive("superscript"),
		command: (editor) => editor.chain().focus().toggleSuperscript().run(),
		icon: SuperscriptIcon,
	},
	{
		name: "Subscript",
		isActive: (editor) => editor.isActive("subscript"),
		command: (editor) => editor.chain().focus().toggleSubscript().run(),
		icon: SubscriptIcon,
	},
];

type FormatSelectorProps = {
	readonly editor: Editor;
	readonly open: boolean;
	readonly onOpenChange: (open: boolean) => void;
};

export const FormatSelector = ({ editor, open, onOpenChange }: FormatSelectorProps) => {
	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<Button className="gap-2 rounded-none border-none" variant="ghost">
					<span className="whitespace-nowrap text-sm">Format</span>
					<ChevronDown className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-48 p-1" sideOffset={5}>
				{items.map((item, index) => (
					<button
						className="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-card"
						key={index}
						onClick={() => {
							item.command(editor);
							onOpenChange(false);
						}}
						type="button"
					>
						<div className="flex items-center space-x-2">
							<div className="rounded-sm bg-background p-1">
								<item.icon className="h-3 w-3" />
							</div>
							<span>{item.name}</span>
						</div>
						{item.isActive(editor) ? <Check className="h-4 w-4" /> : null}
					</button>
				))}
			</PopoverContent>
		</Popover>
	);
};
