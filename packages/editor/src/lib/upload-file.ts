/**
 * File Upload Plugin for TipTap
 *
 * Handles image and file uploads with placeholder support.
 */

import type { EditorState } from "@tiptap/pm/state";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

const uploadKey = new PluginKey("upload-image");

export type UploadFn = (file: File) => Promise<string>;

let uploadFn: UploadFn | null = null;

/**
 * Set the upload function to use for file uploads
 */
export function setUploadFn(fn: UploadFn): void {
	uploadFn = fn;
}

/**
 * Plugin that shows placeholders while images are uploading
 */
export const uploadImagesPlugin = (): Plugin =>
	new Plugin({
		key: uploadKey,
		state: {
			init() {
				return DecorationSet.empty;
			},
			apply(tr, set) {
				set = set.map(tr.mapping, tr.doc);
				const action = tr.getMeta(uploadKey);

				if (action?.add) {
					const { id, pos, src } = action.add;

					const placeholder = document.createElement("div");
					placeholder.setAttribute("class", "img-placeholder");

					if (typeof src === "string" && src.startsWith("data:image/")) {
						const image = document.createElement("img");
						image.setAttribute("class", "opacity-40 rounded-lg border");
						image.src = src;
						placeholder.append(image);
					}

					const deco = Decoration.widget(pos + 1, placeholder, {
						id,
					});
					set = set.add(tr.doc, [deco]);
				} else if (action?.remove) {
					set = set.remove(set.find(undefined, undefined, (spec) => spec.id === action.remove.id));
				}
				return set;
			},
		},
		props: {
			decorations(state) {
				return this.getState(state);
			},
		},
	});

const findPlaceholder = (state: EditorState, id: Record<string, never>): number | null => {
	const decos = uploadKey.getState(state);

	if (!decos) {
		return null;
	}

	const found = decos.find(
		undefined,
		undefined,
		(spec: { id: Record<string, never> }) => spec.id === id,
	);

	return found.length > 0 ? found[0].from : null;
};

/**
 * Start uploading an image file
 */
export const startImageUpload = async (
	file: File,
	view: EditorView,
	pos: number,
): Promise<void> => {
	const isImage = file.type.startsWith("image/");

	if (file.size / 1024 / 1024 > 20) {
		console.error("File size too big (max 20MB).");
		return;
	}

	// A fresh object to act as the ID for this upload
	const id = {} as Record<string, never>;

	// Replace the selection with a placeholder
	const { tr } = view.state;

	if (!tr.selection.empty) {
		tr.deleteSelection();
	}

	const reader = new FileReader();
	reader.readAsDataURL(file);
	reader.addEventListener("load", () => {
		tr.setMeta(uploadKey, {
			add: {
				id,
				pos,
				src: reader.result,
			},
		});
		view.dispatch(tr);
	});

	// Use custom upload function or fallback to data URL
	let publicUrl: string;

	if (uploadFn) {
		try {
			publicUrl = await uploadFn(file);
		} catch (error) {
			console.error("Upload failed:", error);
			// Remove placeholder on error
			const transaction = view.state.tr.setMeta(uploadKey, { remove: { id } });
			view.dispatch(transaction);
			return;
		}
	} else {
		// Fallback: use data URL (not recommended for production)
		publicUrl = await new Promise<string>((resolve) => {
			const dataReader = new FileReader();
			dataReader.readAsDataURL(file);
			dataReader.addEventListener("load", () => {
				resolve(dataReader.result as string);
			});
		});
	}

	// Wait for image to load
	if (isImage) {
		const image = new Image();
		image.src = publicUrl;

		await new Promise((resolve, reject) => {
			image.addEventListener("load", () => resolve(publicUrl));
			image.onerror = (error) => {
				const message =
					typeof error === "string" ? error : "Error uploading image. Please try again.";
				reject(new Error(message));
			};
		});
	}

	const { schema } = view.state;
	const newPos = findPlaceholder(view.state, id);

	if (newPos === null) {
		return;
	}

	const node = isImage
		? schema.nodes.image.create({ src: publicUrl })
		: schema.nodes.file?.createAndFill(
				{
					href: publicUrl,
					fileName: file.name,
				},
				schema.text(file.name),
			);

	if (!node) {
		return;
	}

	const transaction = view.state.tr
		.replaceWith(newPos, newPos, node)
		.setMeta(uploadKey, { remove: { id } });
	view.dispatch(transaction);
};
