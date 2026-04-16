"use client";

/**
 * Bubble Menu
 *
 * Floating toolbar that appears when text is selected.
 */

import { type Editor, BubbleMenu as TiptapBubbleMenu } from "@tiptap/react";
import {
	Bold,
	Code,
	Highlighter,
	Italic,
	Link,
	Strikethrough,
	Subscript,
	Superscript,
	Underline,
} from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export interface BubbleMenuProps {
	editor: Editor | null;
	children?: ReactNode;
}

export interface MenuButtonProps {
	isActive?: boolean;
	onClick: () => void;
	children: ReactNode;
	title?: string;
}

// ============================================================================
// Menu Button Component
// ============================================================================

const MenuButton = ({ isActive, onClick, children, title }: MenuButtonProps) => (
	<button
		type="button"
		className={`bubble-menu-button ${isActive ? "is-active" : ""}`}
		onClick={onClick}
		title={title}
	>
		{children}
	</button>
);

// ============================================================================
// Bubble Menu Component
// ============================================================================

export function BubbleMenu({ editor, children }: BubbleMenuProps) {
	const [linkUrl, setLinkUrl] = useState("");
	const [showLinkInput, setShowLinkInput] = useState(false);

	const setLink = useCallback(() => {
		if (!editor) return;

		if (linkUrl === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
		} else {
			editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
		}
		setShowLinkInput(false);
		setLinkUrl("");
	}, [editor, linkUrl]);

	const openLinkInput = useCallback(() => {
		if (!editor) return;
		const previousUrl = editor.getAttributes("link").href ?? "";
		setLinkUrl(previousUrl);
		setShowLinkInput(true);
	}, [editor]);

	if (!editor) return null;

	return (
		<TiptapBubbleMenu
			editor={editor}
			tippyOptions={{
				duration: 100,
				placement: "top",
			}}
			className="bubble-menu"
		>
			{showLinkInput ? (
				<div className="bubble-menu-link-input">
					<input
						type="url"
						placeholder="Enter URL..."
						value={linkUrl}
						onChange={(e) => setLinkUrl(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								setLink();
							}
							if (e.key === "Escape") {
								setShowLinkInput(false);
								setLinkUrl("");
							}
						}}
					/>
					<button type="button" onClick={setLink}>
						Apply
					</button>
					<button type="button" onClick={() => setShowLinkInput(false)}>
						Cancel
					</button>
				</div>
			) : (
				<>
					<MenuButton
						isActive={editor.isActive("bold")}
						onClick={() => editor.chain().focus().toggleBold().run()}
						title="Bold"
					>
						<Bold size={16} />
					</MenuButton>
					<MenuButton
						isActive={editor.isActive("italic")}
						onClick={() => editor.chain().focus().toggleItalic().run()}
						title="Italic"
					>
						<Italic size={16} />
					</MenuButton>
					<MenuButton
						isActive={editor.isActive("underline")}
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						title="Underline"
					>
						<Underline size={16} />
					</MenuButton>
					<MenuButton
						isActive={editor.isActive("strike")}
						onClick={() => editor.chain().focus().toggleStrike().run()}
						title="Strikethrough"
					>
						<Strikethrough size={16} />
					</MenuButton>

					<div className="bubble-menu-separator" />

					<MenuButton
						isActive={editor.isActive("code")}
						onClick={() => editor.chain().focus().toggleCode().run()}
						title="Inline Code"
					>
						<Code size={16} />
					</MenuButton>
					<MenuButton
						isActive={editor.isActive("highlight")}
						onClick={() => editor.chain().focus().toggleHighlight().run()}
						title="Highlight"
					>
						<Highlighter size={16} />
					</MenuButton>

					<div className="bubble-menu-separator" />

					<MenuButton isActive={editor.isActive("link")} onClick={openLinkInput} title="Link">
						<Link size={16} />
					</MenuButton>

					<div className="bubble-menu-separator" />

					<MenuButton
						isActive={editor.isActive("superscript")}
						onClick={() => editor.chain().focus().toggleSuperscript().run()}
						title="Superscript"
					>
						<Superscript size={16} />
					</MenuButton>
					<MenuButton
						isActive={editor.isActive("subscript")}
						onClick={() => editor.chain().focus().toggleSubscript().run()}
						title="Subscript"
					>
						<Subscript size={16} />
					</MenuButton>

					{children}
				</>
			)}
		</TiptapBubbleMenu>
	);
}

export default BubbleMenu;
