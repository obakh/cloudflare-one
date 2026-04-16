"use client";

/**
 * @repo/editor - TipTap Rich Text Editor
 *
 * A full-featured rich text editor built on TipTap with AI support.
 *
 * @example Basic usage
 * ```tsx
 * import { Editor } from "@repo/editor";
 * import "@repo/editor/styles";
 *
 * function MyEditor() {
 *   return (
 *     <Editor
 *       defaultValue={initialContent}
 *       onDebouncedUpdate={(editor) => saveContent(editor.getJSON())}
 *     />
 *   );
 * }
 * ```
 */

import { useDebouncedCallback } from "@react-hookz/web";
import type { Extensions, JSONContent } from "@tiptap/core";
import { EditorContent, type Editor as EditorInstance, useEditor } from "@tiptap/react";
import deepEqual from "deep-equal";
import { type ReactNode, useRef } from "react";
import { BubbleMenu } from "./components/menus/bubble-menu";
import { TableMenu } from "./components/menus/table-menu";
import { SlashCommand } from "./components/slash-command";
import { defaultExtensions } from "./lib/extensions/client";

import "./styles/editor.css";
import "./components/menus/table-menu.css";

// ============================================================================
// Types
// ============================================================================

export type { Extensions, JSONContent } from "@tiptap/core";
export { mergeAttributes, Node, nodePasteRule } from "@tiptap/core";
export type { Editor as EditorInstance } from "@tiptap/react";
export { NodeViewWrapper, ReactNodeViewRenderer, useEditor } from "@tiptap/react";

export type EditorProps = {
	/** Children to render inside the editor (custom menus, etc.) */
	readonly children?: ReactNode;
	/** Initial content (JSON) */
	readonly defaultValue?: JSONContent;
	/** Editor props passed to TipTap */
	readonly editorProps?: Record<string, unknown>;
	/** Callback on every update */
	readonly onUpdate?: (editor?: EditorInstance) => Promise<void> | void;
	/** Callback on debounced update (500ms) */
	readonly onDebouncedUpdate?: (editor?: EditorInstance) => Promise<void> | void;
	/** Whether the editor is editable */
	readonly editable?: boolean;
	/** Additional extensions to add */
	readonly extensions?: Extensions;
	/** Content to render after the editor */
	readonly slotAfter?: ReactNode;
	/** Custom class name */
	readonly className?: string;
	/** Enable AI features (default: true) */
	readonly enableAI?: boolean;
};

// ============================================================================
// Editor Component
// ============================================================================

export const Editor = ({
	defaultValue,
	editorProps,
	onUpdate,
	onDebouncedUpdate,
	editable = true,
	extensions,
	slotAfter,
	children,
	className,
	enableAI = true,
}: EditorProps) => {
	const lastSnapshot = useRef<JSONContent | null>(null);

	const handleDebouncedUpdate = useDebouncedCallback(
		({ editor }: { editor: EditorInstance }) => {
			const newSnapshot = structuredClone(editor.getJSON());
			const isSame = deepEqual(lastSnapshot.current, newSnapshot);

			if (!isSame) {
				onDebouncedUpdate?.(editor);
				lastSnapshot.current = structuredClone(newSnapshot);
			}
		},
		[onDebouncedUpdate],
		500,
	);

	const handleUpdate = async ({ editor }: { editor: EditorInstance }) =>
		Promise.all([onUpdate?.(editor), handleDebouncedUpdate({ editor })]);

	const handleKeyDown = (_view: unknown, event: KeyboardEvent) => {
		// Handle command navigation for slash commands
		if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "Enter") {
			const slashMenu = document.querySelector("[data-tippy-root]");
			if (slashMenu) {
				return false; // Let the slash command handle it
			}
		}
		return false;
	};

	const editor = useEditor({
		extensions: [...defaultExtensions, SlashCommand, ...(extensions ?? [])] as Extensions,
		content: defaultValue,
		editable,
		editorProps: {
			...editorProps,
			handleDOMEvents: {
				keydown: handleKeyDown,
			},
			attributes: {
				class: "focus:outline-none min-h-[200px]",
			},
		},
		onUpdate: handleUpdate,
		immediatelyRender: false,
	});

	if (!editor) {
		return null;
	}

	return (
		<div className={`relative w-full ${className ?? ""}`}>
			<EditorContent
				className="relative min-h-[5rem] w-full prose prose-sm dark:prose-invert max-w-none"
				editor={editor}
			/>
			{editable && !children ? (
				<>
					<BubbleMenu editor={editor} enableAI={enableAI} />
					<TableMenu editor={editor} />
				</>
			) : null}
			{children}
			{slotAfter}
		</div>
	);
};

// ============================================================================
// Re-exports
// ============================================================================

// Components
export { BubbleMenu } from "./components/menus/bubble-menu";
export { TableMenu } from "./components/menus/table-menu";
// AI
export {
	AICompletionCommands,
	AISelector,
	AISelectorCommands,
	GenerativeMenuSwitch,
} from "./components/plugins/ai";
// Plugins
export { codeBlock } from "./components/plugins/code-block";
export { colorHighlighter } from "./components/plugins/color-highlighter";
export { commonEmojis, type EmojiItem, emojiSuggestion } from "./components/plugins/emoji";
export { feedbackFeatureMark } from "./components/plugins/feedback-feature-mark";
export { fileNode } from "./components/plugins/file";
export { createMentionSuggestions } from "./components/plugins/mention";
export { SuggestionList, type SuggestionListProps } from "./components/plugins/suggestion-list";
export { type FormatItem, FormatSelector } from "./components/selectors/format-selector";
export { getUrlFromString, isValidUrl, LinkSelector } from "./components/selectors/link-selector";
// Selectors
export { NodeSelector, type SelectorItem } from "./components/selectors/node-selector";
export { TextButtons } from "./components/selectors/text-buttons";
export {
	type CommandItem,
	SlashCommand,
	slashCommand,
	suggestionItems,
} from "./components/slash-command";

// Extensions
export { defaultExtensions } from "./lib/extensions/client";
export { serverExtensions } from "./lib/extensions/server";

// Utilities
export { generateHTML } from "./lib/generate-html";
export { convertToAdf } from "./lib/jira";
export {
	contentToHtml,
	contentToMarkdown,
	contentToText,
	htmlToContent,
	htmlToMarkdown,
	htmlToText,
	markdownToContent,
	markdownToHtml,
	markdownToText,
	textToContent,
	textToHtml,
} from "./lib/tiptap";
export {
	setUploadFn,
	startImageUpload,
	type UploadFn,
	uploadImagesPlugin,
} from "./lib/upload-file";
export { default as atlassianTemplate } from "./templates/atlassian.json";
export { default as loomTemplate } from "./templates/loom.json";
// Templates
export { default as notionTemplate } from "./templates/notion.json";

export default Editor;
