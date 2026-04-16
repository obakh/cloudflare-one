/**
 * Jira ADF (Atlassian Document Format) Converter
 *
 * Converts TipTap JSON content to Jira-compatible ADF format.
 */

type JsonNode = Record<string, unknown>;

const applyModifier = (node: unknown, modifier: (n: unknown) => unknown): unknown => {
	if (typeof node !== "object" || node === null) {
		return node;
	}

	if (Array.isArray(node)) {
		return node.map((item) => applyModifier(item, modifier)).filter(Boolean);
	}

	const modifiedNode = modifier(node);

	if (typeof modifiedNode === "object" && modifiedNode !== null) {
		return Object.fromEntries(
			Object.entries(modifiedNode)
				.map(([key, value]) => [key, applyModifier(value, modifier)])
				.filter(([, value]) => value !== null),
		);
	}

	return modifiedNode;
};

const isNodeOfType = (node: unknown, types: string[]): boolean =>
	typeof node === "object" &&
	node !== null &&
	"type" in node &&
	typeof (node as JsonNode).type === "string" &&
	types.includes((node as JsonNode).type as string);

const hasAttrs = (node: unknown): node is { attrs: Record<string, unknown> } =>
	typeof node === "object" &&
	node !== null &&
	"attrs" in node &&
	typeof (node as JsonNode).attrs === "object" &&
	(node as JsonNode).attrs !== null;

const removeBulletListAttrs = (node: unknown): unknown => {
	if (isNodeOfType(node, ["bulletList"])) {
		const { attrs: _attrs, ...rest } = node as JsonNode;
		return rest;
	}
	return node;
};

const replaceOrderedListAttrs = (node: unknown): unknown => {
	if (isNodeOfType(node, ["orderedList"]) && hasAttrs(node)) {
		const { start, tight: _tight, ...restAttrs } = node.attrs;
		return { ...node, attrs: { ...restAttrs, order: start } };
	}
	return node;
};

const replaceMarkAttributes = (node: unknown): unknown => {
	if (
		isNodeOfType(node, ["text"]) &&
		typeof node === "object" &&
		node !== null &&
		"marks" in node &&
		Array.isArray((node as JsonNode).marks)
	) {
		const updatedMarks = ((node as JsonNode).marks as unknown[])
			.map((mark: unknown) => {
				if (typeof mark === "object" && mark !== null && "type" in mark) {
					const markObj = mark as JsonNode;
					if (
						markObj.type === "textColor" &&
						"attrs" in markObj &&
						Object.keys(markObj.attrs as object).length === 0
					) {
						return null;
					}
					switch (markObj.type) {
						case "bold":
							return { ...markObj, type: "strong" };
						case "italic":
							return { ...markObj, type: "em" };
						case "superscript":
							return { ...markObj, type: "subsup", attrs: { type: "sup" } };
						case "subscript":
							return { ...markObj, type: "subsup", attrs: { type: "sub" } };
						default:
							return markObj;
					}
				}
				return mark;
			})
			.filter(Boolean);

		if (updatedMarks.length === 0) {
			const { marks: _m, ...rest } = node as JsonNode;
			return rest;
		}

		return { ...node, marks: updatedMarks };
	}
	return node;
};

const setDefaultCodeBlockLanguage = (node: unknown): unknown => {
	if (
		isNodeOfType(node, ["codeBlock"]) &&
		hasAttrs(node) &&
		"language" in node.attrs &&
		node.attrs.language === null
	) {
		return {
			...node,
			attrs: { ...node.attrs, language: "javascript" },
		};
	}
	return node;
};

const removeIncompatibleNodes = (node: unknown): unknown => {
	if (isNodeOfType(node, ["image", "file", "youtube", "iframely", "figma"])) {
		return null;
	}
	return node;
};

const setEmptyColwidth = (node: unknown): unknown => {
	if (
		isNodeOfType(node, ["tableHeader", "tableCell"]) &&
		hasAttrs(node) &&
		"colwidth" in node.attrs &&
		node.attrs.colwidth === null
	) {
		return {
			...node,
			attrs: { ...node.attrs, colwidth: [] },
		};
	}
	return node;
};

const replaceHorizontalRule = (node: unknown): unknown => {
	if (isNodeOfType(node, ["horizontalRule"])) {
		return { type: "rule" };
	}
	return node;
};

const removeEmptyParagraphs = (node: unknown): unknown => {
	if (isNodeOfType(node, ["paragraph"]) && Object.keys(node as object).length === 1) {
		return null;
	}
	return node;
};

const removeLinkAttributes = (node: unknown): unknown => {
	if (
		isNodeOfType(node, ["text"]) &&
		typeof node === "object" &&
		node !== null &&
		"marks" in node &&
		Array.isArray((node as JsonNode).marks)
	) {
		const updatedMarks = ((node as JsonNode).marks as unknown[]).map((mark: unknown) => {
			if (
				typeof mark === "object" &&
				mark !== null &&
				"type" in mark &&
				(mark as JsonNode).type === "link" &&
				"attrs" in mark &&
				typeof (mark as JsonNode).attrs === "object" &&
				(mark as JsonNode).attrs !== null
			) {
				const {
					rel: _rel,
					class: _className,
					target: _target,
					...restAttrs
				} = (mark as JsonNode).attrs as Record<string, unknown>;
				return { ...mark, attrs: restAttrs };
			}
			return mark;
		});

		if (updatedMarks.length === 0) {
			const { marks: _marks, ...rest } = node as JsonNode;
			return rest;
		}

		return { ...node, marks: updatedMarks };
	}
	return node;
};

const convertEmojiAttributes = (node: unknown): unknown => {
	if (
		isNodeOfType(node, ["emoji"]) &&
		hasAttrs(node) &&
		"name" in node.attrs &&
		typeof node.attrs.name === "string"
	) {
		const { name, ...restAttrs } = node.attrs;
		return {
			...node,
			attrs: {
				...restAttrs,
				shortName: `:${name}:`,
			},
		};
	}
	return node;
};

const modifiers = [
	removeBulletListAttrs,
	replaceOrderedListAttrs,
	replaceMarkAttributes,
	setDefaultCodeBlockLanguage,
	setEmptyColwidth,
	removeIncompatibleNodes,
	replaceHorizontalRule,
	removeEmptyParagraphs,
	removeLinkAttributes,
	convertEmojiAttributes,
];

/**
 * Convert TipTap JSON content to Jira ADF format
 */
export const convertToAdf = (body: JsonNode): JsonNode => {
	const applyAllModifiers = (node: unknown): unknown =>
		modifiers.reduce((acc, modifier) => applyModifier(acc, modifier), node);

	return applyAllModifiers(body) as JsonNode;
};
