"use client";

/**
 * Editor Toolbar
 *
 * Fixed toolbar for editor actions.
 */

import type { Editor } from "@tiptap/react";
import {
	Bold,
	Code,
	Heading1,
	Heading2,
	Heading3,
	Highlighter,
	Image,
	Italic,
	Link,
	List,
	ListOrdered,
	Minus,
	Quote,
	Redo,
	Strikethrough,
	Table,
	Underline,
	Undo,
} from "lucide-react";
import { type ReactNode, useCallback } from "react";

// ============================================================================
// Types
// ============================================================================

export interface ToolbarProps {
	editor: Editor | null;
	children?: ReactNode;
}

export interface ToolbarButtonProps {
	isActive?: boolean;
	disabled?: boolean;
	onClick: () => void;
	children: ReactNode;
	title?: string;
}

// ============================================================================
// Toolbar Button Component
// ============================================================================

const ToolbarButton = ({ isActive, disabled, onClick, children, title }: ToolbarButtonProps) => (
	<button
		type="button"
		className={`toolbar-button ${isActive ? "is-active" : ""}`}
		onClick={onClick}
		disabled={disabled}
		title={title}
	>
		{children}
	</button>
);

const ToolbarSeparator = () => <div className="toolbar-separator" />;

// ============================================================================
// Toolbar Component
// ============================================================================

export function Toolbar({ editor, children }: ToolbarProps) {
	const addImage = useCallback(() => {
		if (!editor) return;
		const url = window.prompt("Enter image URL:");
		if (url) {
			editor.chain().focus().setImage({ src: url }).run();
		}
	}, [editor]);

	const addLink = useCallback(() => {
		if (!editor) return;
		const previousUrl = editor.getAttributes("link").href ?? "";
		const url = window.prompt("Enter URL:", previousUrl);
		if (url === null) return;
		if (url === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
		} else {
			editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
		}
	}, [editor]);

	const addTable = useCallback(() => {
		if (!editor) return;
		editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
	}, [editor]);

	if (!editor) return null;

	return (
		<div className="editor-toolbar">
			{/* History */}
			<ToolbarButton
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().undo()}
				title="Undo"
			>
				<Undo size={18} />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.chain().focus().redo().run()}
				disabled={!editor.can().redo()}
				title="Redo"
			>
				<Redo size={18} />
			</ToolbarButton>

			<ToolbarSeparator />

			{/* Headings */}
			<ToolbarButton
				isActive={editor.isActive("heading", { level: 1 })}
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				title="Heading 1"
			>
				<Heading1 size={18} />
			</ToolbarButton>
			<ToolbarButton
				isActive={editor.isActive("heading", { level: 2 })}
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				title="Heading 2"
			>
				<Heading2 size={18} />
			</ToolbarButton>
			<ToolbarButton
				isActive={editor.isActive("heading", { level: 3 })}
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				title="Heading 3"
			>
				<Heading3 size={18} />
			</ToolbarButton>

			<ToolbarSeparator />

			{/* Text Formatting */}
			<ToolbarButton
				isActive={editor.isActive("bold")}
				onClick={() => editor.chain().focus().toggleBold().run()}
				title="Bold"
			>
				<Bold size={18} />
			</ToolbarButton>
			<ToolbarButton
				isActive={editor.isActive("italic")}
				onClick={() => editor.chain().focus().toggleItalic().run()}
				title="Italic"
			>
				<Italic size={18} />
			</ToolbarButton>
			<ToolbarButton
				isActive={editor.isActive("underline")}
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				title="Underline"
			>
				<Underline size={18} />
			</ToolbarButton>
			<ToolbarButton
				isActive={editor.isActive("strike")}
				onClick={() => editor.chain().focus().toggleStrike().run()}
				title="Strikethrough"
			>
				<Strikethrough size={18} />
			</ToolbarButton>
			<ToolbarButton
				isActive={editor.isActive("code")}
				onClick={() => editor.chain().focus().toggleCode().run()}
				title="Inline Code"
			>
				<Code size={18} />
			</ToolbarButton>
			<ToolbarButton
				isActive={editor.isActive("highlight")}
				onClick={() => editor.chain().focus().toggleHighlight().run()}
				title="Highlight"
			>
				<Highlighter size={18} />
			</ToolbarButton>

			<ToolbarSeparator />

			{/* Lists */}
			<ToolbarButton
				isActive={editor.isActive("bulletList")}
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				title="Bullet List"
			>
				<List size={18} />
			</ToolbarButton>
			<ToolbarButton
				isActive={editor.isActive("orderedList")}
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				title="Numbered List"
			>
				<ListOrdered size={18} />
			</ToolbarButton>

			<ToolbarSeparator />

			{/* Blocks */}
			<ToolbarButton
				isActive={editor.isActive("blockquote")}
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				title="Quote"
			>
				<Quote size={18} />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
				title="Divider"
			>
				<Minus size={18} />
			</ToolbarButton>

			<ToolbarSeparator />

			{/* Media & Links */}
			<ToolbarButton isActive={editor.isActive("link")} onClick={addLink} title="Link">
				<Link size={18} />
			</ToolbarButton>
			<ToolbarButton onClick={addImage} title="Image">
				<Image size={18} />
			</ToolbarButton>
			<ToolbarButton onClick={addTable} title="Table">
				<Table size={18} />
			</ToolbarButton>

			{children}
		</div>
	);
}

export default Toolbar;
