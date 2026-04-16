/**
 * Client-side TipTap Extensions
 *
 * Extensions for use in browser/React components.
 */

import { cn } from "@repo/ui";
import type { Extension } from "@tiptap/core";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import StarterKit from "@tiptap/starter-kit";
import { Figma } from "tiptap-extension-figma";
import { Iframely } from "tiptap-extension-iframely";
import { codeBlock } from "../../components/plugins/code-block";
import { colorHighlighter } from "../../components/plugins/color-highlighter";
import { feedbackFeatureMark } from "../../components/plugins/feedback-feature-mark";
import { fileNode } from "../../components/plugins/file";
import { uploadImagesPlugin } from "../upload-file";

const placeholder = Placeholder.configure({
	placeholder: "Start writing...",
	emptyEditorClass: "is-editor-empty",
});

const tiptapLink = Link.configure({
	HTMLAttributes: {
		class: cn(
			"cursor-pointer text-muted-foreground underline underline-offset-[3px] transition-colors",
			"hover:text-violet-500",
			"dark:hover:text-violet-400",
		),
	},
});

const tiptapImage = Image.extend({
	addProseMirrorPlugins() {
		return [uploadImagesPlugin()];
	},
}).configure({
	allowBase64: true,
	HTMLAttributes: {
		class: "rounded-lg border",
	},
});

const taskList = TaskList.configure({
	HTMLAttributes: {
		class: "not-prose pl-2",
	},
});

const taskItem = TaskItem.configure({
	HTMLAttributes: {
		class: "flex items-start my-2",
	},
	nested: true,
});

const table = Table.configure({
	HTMLAttributes: {
		class: "table-fixed m-0 overflow-hidden mx-auto my-3 border-collapse rounded-none",
	},
	allowTableNodeSelection: true,
});

const tableRow = TableRow.configure({
	HTMLAttributes: {
		class: "border box-border min-w-[1em] py-2 px-1 relative align-top text-start !py-1",
	},
});

const tableCell = TableCell.configure({
	HTMLAttributes: {
		class: "border box-border min-w-[1em] py-2 px-1 relative align-top text-start !py-1",
	},
});

const tableHeader = TableHeader.configure({
	HTMLAttributes: {
		class:
			"bg-background font-semibold border box-border min-w-[1em] py-2 px-1 relative align-top text-start !py-1",
	},
});

const youtube = Youtube.configure({
	inline: false,
});

const highlight = Highlight.configure({
	multicolor: true,
});

const superscript = Superscript.configure();
const subscript = Subscript.configure();
const color = Color.configure();
const underline = Underline.configure();
const textStyle = TextStyle.configure();

const starterKit = StarterKit.configure({
	bulletList: {
		HTMLAttributes: {
			class: "list-disc list-outside leading-3",
		},
	},
	orderedList: {
		HTMLAttributes: {
			class: "list-decimal list-outside leading-3",
		},
	},
	listItem: {
		HTMLAttributes: {
			class: "leading-normal -mb-2",
		},
	},
	blockquote: {
		HTMLAttributes: {
			class: "border-l-4 border-primary",
		},
	},
	codeBlock: false,
	code: {
		HTMLAttributes: {
			class: "rounded-md px-1.5 py-1 font-mono font-medium bg-background",
			spellcheck: "false",
		},
	},
	horizontalRule: {
		HTMLAttributes: {
			class: "mt-4 mb-6 border-t",
		},
	},
	dropcursor: {
		color: "#DBEAFE",
		width: 4,
	},
	history: false,
});

export const defaultExtensions = [
	starterKit,
	placeholder,
	tiptapLink,
	tiptapImage,
	taskList,
	taskItem,
	table,
	tableRow,
	tableCell,
	tableHeader,
	codeBlock,
	youtube,
	highlight,
	superscript,
	subscript,
	color,
	underline,
	textStyle,
	colorHighlighter,
	fileNode,
	feedbackFeatureMark,
	Figma,
	Iframely,
] as Extension[];

// Re-export individual extensions for customization
export {
	Color,
	Highlight,
	Image,
	Link,
	Placeholder,
	StarterKit,
	Subscript,
	Superscript,
	Table,
	TableCell,
	TableHeader,
	TableRow,
	TaskItem,
	TaskList,
	TextStyle,
	Underline,
	Youtube,
};
