/**
 * TipTap Utilities
 *
 * Server-side utilities for content conversion.
 */

import { generateText } from "@tiptap/core";
import { generateJSON } from "@tiptap/html";
import { Window } from "happy-dom";
import { serverExtensions } from "./extensions/server";
import { generateHTML } from "./generate-html";

export type JsonContent = Record<string, unknown>;

/**
 * Convert HTML to TipTap JSON content
 */
export const htmlToContent = (html: string): JsonContent =>
	generateJSON(html, serverExtensions) as JsonContent;

/**
 * Convert HTML to plain text
 */
export const htmlToText = (html: string): string => {
	const window = new Window();
	window.document.body.innerHTML = html;
	return window.document.body.textContent ?? "";
};

/**
 * Convert TipTap JSON content to HTML
 */
export const contentToHtml = (json: JsonContent): string => {
	try {
		return generateHTML(json, serverExtensions);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to convert content to HTML: ${message}`);
	}
};

/**
 * Convert TipTap JSON content to plain text
 */
export const contentToText = (json: JsonContent): string => generateText(json, serverExtensions);

/**
 * Convert plain text to HTML (wraps each line in <p> tags)
 */
export const textToHtml = (text: string): string =>
	text
		.split("\n")
		.map((line) => `<p>${line}</p>`)
		.join("");

/**
 * Convert plain text to TipTap JSON content
 */
export const textToContent = (text: string): JsonContent => htmlToContent(textToHtml(text));

/**
 * Unwrap images from paragraph tags (for TipTap compatibility)
 */
const unwrapImagesFromParagraphs = (html: string): string => {
	const window = new Window();
	window.document.body.innerHTML = html;

	const paragraphs = [...window.document.querySelectorAll("p")];
	for (const paragraph of paragraphs) {
		const images = [...paragraph.querySelectorAll("img")];
		if (images.length > 0) {
			for (const image of images) {
				paragraph.parentNode?.insertBefore(image, paragraph.nextSibling);
			}

			if (paragraph.innerHTML.trim() === "") {
				paragraph.remove();
			}
		}
	}

	return window.document.body.innerHTML;
};

/**
 * Convert YouTube image placeholders to iframes
 */
const convertYouTubeImgToIframe = (html: string): string => {
	const window = new Window();
	window.document.body.innerHTML = html;

	const images = [...window.document.querySelectorAll("img")];

	for (const image of images) {
		const src = image.getAttribute("src");
		if (!src) continue;

		try {
			const url = new URL(src);
			const allowedYouTubeHosts = ["youtube.com", "www.youtube.com"];
			if (allowedYouTubeHosts.includes(url.hostname)) {
				const div = window.document.createElement("div");
				div.dataset.youtubeVideo = "";

				const iframe = window.document.createElement("iframe");
				iframe.src = src;

				div.append(iframe);
				image.parentNode?.replaceChild(div, image);
			}
		} catch {
			console.error(`Invalid URL: ${src}`);
		}
	}

	return window.document.body.innerHTML;
};

/**
 * Convert markdown to HTML (basic implementation)
 * For full markdown support, use a library like 'marked'
 */
export const markdownToHtml = async (markdown: string): Promise<string> => {
	// Basic markdown conversion - for full support, import 'marked'
	let html = markdown
		.replace(/^### (.*$)/gim, "<h3>$1</h3>")
		.replace(/^## (.*$)/gim, "<h2>$1</h2>")
		.replace(/^# (.*$)/gim, "<h1>$1</h1>")
		.replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
		.replace(/\*(.*)\*/gim, "<em>$1</em>")
		.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
		.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
		.replace(/\n/gim, "<br>");

	html = unwrapImagesFromParagraphs(html);
	html = convertYouTubeImgToIframe(html);

	return html;
};

/**
 * Convert markdown to TipTap JSON content
 */
export const markdownToContent = async (markdown: string): Promise<JsonContent> =>
	htmlToContent(await markdownToHtml(markdown));

/**
 * Convert markdown to plain text
 */
export const markdownToText = async (markdown: string): Promise<string> =>
	htmlToText(await markdownToHtml(markdown));

/**
 * Convert TipTap JSON content to markdown (basic implementation)
 */
export const contentToMarkdown = (content: JsonContent): string => {
	const html = contentToHtml(content);
	// Basic HTML to markdown - for full support, use 'node-html-markdown'
	return html
		.replace(/<h1>(.*?)<\/h1>/gi, "# $1\n")
		.replace(/<h2>(.*?)<\/h2>/gi, "## $1\n")
		.replace(/<h3>(.*?)<\/h3>/gi, "### $1\n")
		.replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
		.replace(/<em>(.*?)<\/em>/gi, "*$1*")
		.replace(/<a href="(.*?)">(.*?)<\/a>/gi, "[$2]($1)")
		.replace(/<img.*?src="(.*?)".*?alt="(.*?)".*?>/gi, "![$2]($1)")
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<p>(.*?)<\/p>/gi, "$1\n")
		.replace(/<[^>]+>/g, "");
};

/**
 * Convert HTML to markdown
 */
export const htmlToMarkdown = (html: string): string => {
	return html
		.replace(/<h1>(.*?)<\/h1>/gi, "# $1\n")
		.replace(/<h2>(.*?)<\/h2>/gi, "## $1\n")
		.replace(/<h3>(.*?)<\/h3>/gi, "### $1\n")
		.replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
		.replace(/<em>(.*?)<\/em>/gi, "*$1*")
		.replace(/<a href="(.*?)">(.*?)<\/a>/gi, "[$2]($1)")
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<p>(.*?)<\/p>/gi, "$1\n")
		.replace(/<[^>]+>/g, "");
};
