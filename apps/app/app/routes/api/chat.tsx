import type { Route } from "./+types/chat";
// import { getEnv } from "~/lib/env";
// import { requireAuth } from "~/lib/auth.server";

/**
 * AI Chat API endpoint
 * Uses @repo/ai for AI interactions
 */
export async function action({ request, context }: Route.ActionArgs) {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	// Real implementation with @repo/ai:
	// const env = getEnv(context);
	// const user = await requireAuth(request, env);
	//
	// const { messages } = await request.json();
	//
	// // Use @repo/ai for streaming response
	// const stream = await generateChatResponse({
	//   messages,
	//   model: "gpt-4o-mini",
	//   systemPrompt: "You are a helpful assistant for a SaaS application.",
	// });
	//
	// return new Response(stream, {
	//   headers: {
	//     "Content-Type": "text/event-stream",
	//     "Cache-Control": "no-cache",
	//     Connection: "keep-alive",
	//   },
	// });

	// Mock response for development
	const body = (await request.json()) as { messages: Array<{ content: string }> };
	const lastMessage = body.messages[body.messages.length - 1];

	const response = getMockResponse(lastMessage.content);

	return Response.json({
		id: crypto.randomUUID(),
		role: "assistant",
		content: response,
	});
}

function getMockResponse(input: string): string {
	const lowerInput = input.toLowerCase();

	if (lowerInput.includes("activity") || lowerInput.includes("recent")) {
		return "Here's a summary of your recent activity:\n\n• 3 new team members joined this week\n• 12 files uploaded to the vault\n• 5 settings changes made\n\nWould you like more details on any of these?";
	}

	if (lowerInput.includes("report") || lowerInput.includes("generate")) {
		return "I can help you generate reports! What type of report would you like?\n\n1. Activity Report\n2. Usage Analytics\n3. Team Performance\n4. Custom Report\n\nJust let me know which one interests you.";
	}

	if (lowerInput.includes("settings") || lowerInput.includes("help")) {
		return "I can help you with settings! Here are some common tasks:\n\n• Update your profile\n• Manage team members\n• Configure notifications\n• Set up integrations\n\nWhat would you like to do?";
	}

	return "I understand you're asking about that. Let me help you with more information. Could you provide more details about what you're looking for?";
}
