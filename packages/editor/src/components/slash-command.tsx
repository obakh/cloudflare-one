"use client";

/**
 * Slash Command
 *
 * Type "/" to open a command menu for inserting blocks.
 */

import { Extension, type Range } from "@tiptap/core";
import { type Editor, ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions, type SuggestionProps } from "@tiptap/suggestion";
import {
	AppWindowIcon,
	CheckSquare,
	Code,
	FileIcon,
	Heading1,
	Heading2,
	Heading3,
	ImageIcon,
	List,
	ListOrdered,
	TableIcon,
	Text,
	TextQuote,
} from "lucide-react";
import {
	forwardRef,
	type ReactNode,
	useCallback,
	useEffect,
	useImperativeHandle,
	useState,
} from "react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { startImageUpload } from "../lib/upload-file";

// ============================================================================
// Types
// ============================================================================

export type CommandItem = {
	title: string;
	description: string;
	icon: ReactNode;
	searchTerms?: string[];
	command: (props: { editor: Editor; range: Range }) => void;
};

export type CommandListRef = {
	onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

type CommandListProps = {
	items: CommandItem[];
	command: (item: CommandItem) => void;
};

// ============================================================================
// Default Commands
// ============================================================================

export const suggestionItems: CommandItem[] = [
	{
		title: "Text",
		description: "Just start typing with plain text.",
		searchTerms: ["p", "paragraph"],
		icon: <Text size={18} />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").run();
		},
	},
	{
		title: "To-do List",
		description: "Track tasks with a to-do list.",
		searchTerms: ["todo", "task", "list", "check", "checkbox"],
		icon: <CheckSquare size={18} />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleTaskList().run();
		},
	},
	{
		title: "Heading 1",
		description: "Big section heading.",
		searchTerms: ["title", "big", "large"],
		icon: <Heading1 size={18} />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
		},
	},
	{
		title: "Heading 2",
		description: "Medium section heading.",
		searchTerms: ["subtitle", "medium"],
		icon: <Heading2 size={18} />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
		},
	},
	{
		title: "Heading 3",
		description: "Small section heading.",
		searchTerms: ["subtitle", "small"],
		icon: <Heading3 size={18} />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
		},
	},
	{
		title: "Bullet List",
		description: "Create a simple bullet list.",
		searchTerms: ["unordered", "point"],
		icon: <List size={18} />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleBulletList().run();
		},
	},
	{
		title: "Numbered List",
		description: "Create a list with numbering.",
		searchTerms: ["ordered"],
		icon: <ListOrdered size={18} />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleOrderedList().run();
		},
	},
	{
		title: "Quote",
		description: "Capture a quote.",
		searchTerms: ["blockquote"],
		icon: <TextQuote size={18} />,
		command: ({ editor, range }) =>
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.toggleNode("paragraph", "paragraph")
				.toggleBlockquote()
				.run(),
	},
	{
		title: "Code",
		description: "Capture a code snippet.",
		searchTerms: ["codeblock"],
		icon: <Code size={18} />,
		command: ({ editor, range }) =>
			editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
	},
	{
		title: "Image",
		description: "Upload an image from your computer.",
		searchTerms: ["photo", "picture", "media"],
		icon: <ImageIcon size={18} />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).run();
			const input = document.createElement("input");
			input.type = "file";
			input.accept = "image/*";
			input.addEventListener("change", async () => {
				if (!input.files?.length) {
					return;
				}

				const [file] = [...input.files];
				const pos = editor.view.state.selection.from;

				await startImageUpload(file, editor.view, pos);
			});
			input.click();
		},
	},
	{
		title: "File",
		description: "Upload a file from your computer.",
		searchTerms: ["file", "attachment"],
		icon: <FileIcon size={18} />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).run();
			const input = document.createElement("input");
			input.type = "file";
			input.addEventListener("change", async () => {
				if (!input.files?.length) {
					return;
				}

				const [file] = [...input.files];
				const pos = editor.view.state.selection.from;

				await startImageUpload(file, editor.view, pos);
			});
			input.click();
		},
	},
	{
		title: "Table",
		description: "Add a table view to organize data.",
		searchTerms: ["table"],
		icon: <TableIcon size={18} />,
		command: ({ editor, range }) =>
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
				.run(),
	},
	{
		title: "Embed Content",
		description: "Embed content from 1900+ sites.",
		searchTerms: ["iframely", "embed", "figma"],
		icon: <AppWindowIcon size={18} />,
		command: ({ editor, range }) => {
			const url = window.prompt("Enter URL to embed");

			if (!url) {
				return;
			}

			editor.chain().focus().deleteRange(range).run();

			// Check if it's a Figma URL
			if (url.includes("figma.com")) {
				editor.chain().focus().setFigma({ src: url }).run();
			} else {
				// Use Iframely for other URLs
				editor.chain().focus().setIframelyEmbed({ src: url }).run();
			}
		},
	},
];

// ============================================================================
// Command List Component
// ============================================================================

const CommandList = forwardRef<CommandListRef, CommandListProps>(({ items, command }, ref) => {
	const [selectedIndex, setSelectedIndex] = useState(0);

	const selectItem = useCallback(
		(index: number) => {
			const item = items[index];
			if (item) {
				command(item);
			}
		},
		[items, command],
	);

	useEffect(() => {
		setSelectedIndex(0);
	}, [items]);

	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }) => {
			if (event.key === "ArrowUp") {
				setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
				return true;
			}
			if (event.key === "ArrowDown") {
				setSelectedIndex((prev) => (prev + 1) % items.length);
				return true;
			}
			if (event.key === "Enter") {
				selectItem(selectedIndex);
				return true;
			}
			return false;
		},
	}));

	if (items.length === 0) {
		return (
			<div className="not-prose z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border bg-background px-1 py-2 shadow-md transition-all">
				<div className="px-2 text-muted-foreground">No results</div>
			</div>
		);
	}

	return (
		<div className="not-prose z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border bg-background px-1 py-2 shadow-md transition-all">
			{items.map((item, index) => (
				<button
					key={item.title}
					type="button"
					className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-secondary ${
						index === selectedIndex ? "bg-secondary" : ""
					}`}
					onClick={() => selectItem(index)}
					onMouseEnter={() => setSelectedIndex(index)}
				>
					<div className="flex h-10 w-10 items-center justify-center rounded-md bg-background">
						{item.icon}
					</div>
					<div>
						<p className="font-medium">{item.title}</p>
						<p className="text-muted-foreground text-xs">{item.description}</p>
					</div>
				</button>
			))}
		</div>
	);
});

CommandList.displayName = "CommandList";

// ============================================================================
// Slash Command Extension
// ============================================================================

export interface SlashCommandOptions {
	suggestion: Partial<SuggestionOptions>;
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
	name: "slashCommand",

	addOptions() {
		return {
			suggestion: {
				char: "/",
				command: ({ editor, range, props }) => {
					props.command({ editor, range });
				},
			},
		};
	},

	addProseMirrorPlugins() {
		return [
			Suggestion({
				editor: this.editor,
				...this.options.suggestion,
				items: ({ query }: { query: string }) => {
					return suggestionItems.filter((item) => {
						const searchText = query.toLowerCase();
						return (
							item.title.toLowerCase().includes(searchText) ||
							item.description.toLowerCase().includes(searchText) ||
							item.searchTerms?.some((term) => term.toLowerCase().includes(searchText))
						);
					});
				},
				render: () => {
					let component: ReactRenderer<CommandListRef> | null = null;
					let popup: TippyInstance[] | null = null;

					return {
						onStart: (props: SuggestionProps<CommandItem>) => {
							component = new ReactRenderer(CommandList, {
								props: {
									items: props.items,
									command: (item: CommandItem) => {
										item.command({ editor: props.editor, range: props.range });
									},
								},
								editor: props.editor,
							});

							if (!props.clientRect) return;

							popup = tippy("body", {
								getReferenceClientRect: props.clientRect as () => DOMRect,
								appendTo: () => document.body,
								content: component.element,
								showOnCreate: true,
								interactive: true,
								trigger: "manual",
								placement: "bottom-start",
							});
						},
						onUpdate: (props: SuggestionProps<CommandItem>) => {
							component?.updateProps({
								items: props.items,
								command: (item: CommandItem) => {
									item.command({ editor: props.editor, range: props.range });
								},
							});

							if (popup?.[0] && props.clientRect) {
								popup[0].setProps({
									getReferenceClientRect: props.clientRect as () => DOMRect,
								});
							}
						},
						onKeyDown: (props: { event: KeyboardEvent }) => {
							if (props.event.key === "Escape") {
								popup?.[0]?.hide();
								return true;
							}
							return component?.ref?.onKeyDown(props) ?? false;
						},
						onExit: () => {
							popup?.[0]?.destroy();
							component?.destroy();
						},
					};
				},
			}),
		];
	},
});

export const slashCommand = SlashCommand;
