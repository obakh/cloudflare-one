/**
 * Server-side TipTap Extensions
 *
 * Extensions for server-side HTML generation (no browser APIs).
 */

import { type Extension, mergeAttributes, Node } from "@tiptap/core";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
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

// File node for server-side rendering
const FileNode = Node.create({
	name: "file",
	group: "inline",
	inline: true,
	selectable: true,
	draggable: true,

	addAttributes() {
		return {
			href: {
				default: null,
			},
			fileName: {
				default: null,
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "a.file[href]",
			},
		];
	},

	renderHTML({ node, HTMLAttributes }) {
		return [
			"a",
			mergeAttributes(HTMLAttributes, {
				"data-type": "file",
				target: "_blank",
				rel: "noopener noreferrer",
			}),
			node.attrs.fileName,
		];
	},
});

export const serverExtensions = [
	Link,
	Image,
	TaskList,
	TaskItem,
	Table,
	TableRow,
	TableCell,
	TableHeader,
	Youtube,
	Superscript,
	Subscript,
	StarterKit,
	Highlight,
	Underline,
	TextStyle,
	Color,
	FileNode,
	Figma,
	Iframely,
] as Extension[];

export { serverExtensions as defaultExtensions };
