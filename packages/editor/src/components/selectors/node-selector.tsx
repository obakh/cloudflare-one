"use client";

/**
 * Node Selector
 *
 * Dropdown to change block type (paragraph, heading, list, etc.)
 */

import { Button, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import type { Editor } from "@tiptap/react";
import type { LucideIcon } from "lucide-react";
import {
	Check,
	CheckSquare,
	ChevronDown,
	Code,
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	TextIcon,
	TextQuote,
} from "lucide-react";

export type SelectorItem = {
	name: string;
	icon: LucideIcon;
	command: (editor: Editor) => void;
	isActive: (editor: Editor) => boolean;
};

const items: SelectorItem[] = [
	{
		name: "Text",
		icon: TextIcon,
		command: (editor) => editor.chain().focus().toggleNode("paragraph", "paragraph").run(),
		isActive: (editor) =>
			editor.isActive("paragraph") &&
			!editor.isActive("bulletList") &&
			!editor.isActive("orderedList"),
	},
	{
		name: "Heading 1",
		icon: Heading1,
		command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
		isActive: (editor) => editor.isActive("heading", { level: 1 }),
	},
	{
		name: "Heading 2",
		icon: Heading2,
		command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
		isActive: (editor) => editor.isActive("heading", { level: 2 }),
	},
	{
		name: "Heading 3",
		icon: Heading3,
		command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
		isActive: (editor) => editor.isActive("heading", { level: 3 }),
	},
	{
		name: "To-do List",
		icon: CheckSquare,
		command: (editor) => editor.chain().focus().toggleTaskList().run(),
		isActive: (editor) => editor.isActive("taskItem"),
	},
	{
		name: "Bullet List",
		icon: List,
		command: (editor) => editor.chain().focus().toggleBulletList().run(),
		isActive: (editor) => editor.isActive("bulletList"),
	},
	{
		name: "Numbered List",
		icon: ListOrdered,
		command: (editor) => editor.chain().focus().toggleOrderedList().run(),
		isActive: (editor) => editor.isActive("orderedList"),
	},
	{
		name: "Quote",
		icon: TextQuote,
		command: (editor) =>
			editor.chain().focus().toggleNode("paragraph", "paragraph").toggleBlockquote().run(),
		isActive: (editor) => editor.isActive("blockquote"),
	},
	{
		name: "Code",
		icon: Code,
		command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
		isActive: (editor) => editor.isActive("codeBlock"),
	},
];

type NodeSelectorProps = {
	readonly editor: Editor;
	readonly open: boolean;
	readonly onOpenChange: (open: boolean) => void;
};

export const NodeSelector = ({ editor, open, onOpenChange }: NodeSelectorProps) => {
	const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? {
		name: "Text",
	};

	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<Button className="gap-2 rounded-none border-none" variant="ghost">
					<span className="whitespace-nowrap text-sm">{activeItem.name}</span>
					<ChevronDown className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-48 p-1" sideOffset={5}>
				{items.map((item) => (
					<button
						className="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-card"
						key={item.name}
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
						{activeItem.name === item.name && <Check className="h-4 w-4" />}
					</button>
				))}
			</PopoverContent>
		</Popover>
	);
};
