/**
 * Server-side HTML Generation
 *
 * Generate HTML from TipTap JSON content without browser APIs.
 * Uses happy-dom for DOM serialization.
 */

import { type Extensions, getSchema, type JSONContent } from "@tiptap/core";
import { DOMSerializer, Node } from "@tiptap/pm/model";
import { Window } from "happy-dom";

/**
 * Generate HTML from TipTap JSON content
 *
 * @example
 * ```ts
 * import { generateHTML } from "@repo/editor/lib/generate-html";
 * import { serverExtensions } from "@repo/editor/extensions/server";
 *
 * const html = generateHTML(jsonContent, serverExtensions);
 * ```
 */
export const generateHTML = (doc: JSONContent, extensions: Extensions): string => {
	const schema = getSchema(extensions);
	const contentNode = Node.fromJSON(schema, doc);

	const window = new Window();

	const fragment = DOMSerializer.fromSchema(schema).serializeFragment(contentNode.content, {
		document: window.document as unknown as Document,
	});

	const serializer = new window.XMLSerializer();

	return serializer.serializeToString(fragment as never);
};
