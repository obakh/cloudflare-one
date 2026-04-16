"use client";

/**
 * Link Selector
 *
 * Popover for adding/editing links.
 */

import { Button, cn, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import type { Editor } from "@tiptap/react";
import { Check, ExternalLinkIcon, Trash } from "lucide-react";
import type { FormEventHandler } from "react";
import { useEffect, useRef, useState } from "react";

export const isValidUrl = (url: string): boolean => {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};

export const getUrlFromString = (text: string): string | null => {
	if (isValidUrl(text)) {
		return text;
	}
	try {
		if (text.includes(".") && !text.includes(" ")) {
			return new URL(`https://${text}`).toString();
		}

		return null;
	} catch {
		return null;
	}
};

type LinkSelectorProps = {
	readonly editor: Editor;
	readonly open: boolean;
	readonly onOpenChange: (open: boolean) => void;
};

export const LinkSelector = ({ editor, open, onOpenChange }: LinkSelectorProps) => {
	const [url, setUrl] = useState<string>("");
	const inputReference = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputReference.current?.focus();
	}, []);

	const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault();

		const href = getUrlFromString(url);

		if (href) {
			editor.chain().focus().setLink({ href }).run();
			onOpenChange(false);
		}
	};

	const defaultValue = (editor.getAttributes("link") as { href?: string }).href;

	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<Button className="gap-2 rounded-none border-none" variant="ghost">
					<ExternalLinkIcon className="h-4 w-4" />
					<p
						className={cn("underline decoration-muted-foreground underline-offset-4", {
							"text-primary": editor.isActive("link"),
						})}
					>
						Link
					</p>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-60 p-0" sideOffset={10}>
				<form className="flex p-1" onSubmit={handleSubmit}>
					<input
						aria-label="Link URL"
						className="flex-1 bg-background p-1 text-sm outline-none"
						defaultValue={defaultValue ?? ""}
						onChange={(event) => setUrl(event.target.value)}
						placeholder="Paste a link"
						ref={inputReference}
						type="text"
						value={url}
					/>
					{editor.getAttributes("link").href ? (
						<Button
							className="flex h-8 items-center rounded-sm p-1 text-destructive transition-all hover:bg-destructive/10"
							onClick={() => {
								editor.chain().focus().unsetLink().run();
								onOpenChange(false);
							}}
							size="icon"
							type="button"
							variant="outline"
						>
							<Trash className="h-4 w-4" />
						</Button>
					) : (
						<Button className="h-8" size="icon" variant="secondary">
							<Check className="h-4 w-4" />
						</Button>
					)}
				</form>
			</PopoverContent>
		</Popover>
	);
};
