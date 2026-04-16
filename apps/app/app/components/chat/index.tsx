import { Bot, Send, Sparkles, User, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

interface ChatProps {
	isOpen: boolean;
	onClose: () => void;
}

/**
 * AI Chat component - slide-over panel for AI assistant
 * Uses @repo/ai for AI interactions
 */
export function Chat({ isOpen, onClose }: ChatProps) {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "welcome",
			role: "assistant",
			content:
				"Hi! I'm your AI assistant. I can help you with questions about your data, generate reports, or assist with tasks. What would you like to do?",
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	useEffect(() => {
		if (isOpen) {
			inputRef.current?.focus();
		}
	}, [isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		const userMessage: Message = {
			id: crypto.randomUUID(),
			role: "user",
			content: input.trim(),
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		// Real implementation with @repo/ai:
		// const response = await fetch("/api/chat", {
		//   method: "POST",
		//   body: JSON.stringify({ messages: [...messages, userMessage] }),
		// });
		// const data = await response.json();

		// Mock response for demo
		setTimeout(() => {
			const assistantMessage: Message = {
				id: crypto.randomUUID(),
				role: "assistant",
				content: getMockResponse(userMessage.content),
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, assistantMessage]);
			setIsLoading(false);
		}, 1000);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<button
				type="button"
				className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm cursor-default"
				onClick={onClose}
				aria-label="Close chat"
			/>

			{/* Chat Panel */}
			<div className="fixed right-0 top-0 z-50 flex h-full w-[400px] flex-col border-l bg-background shadow-lg">
				{/* Header */}
				<div className="flex items-center justify-between border-b px-4 py-3">
					<div className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
							<Sparkles className="h-4 w-4 text-primary" />
						</div>
						<div>
							<h2 className="font-semibold">AI Assistant</h2>
							<p className="text-xs text-muted-foreground">Powered by AI</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-2 hover:bg-accent"
						aria-label="Close"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{messages.map((message) => (
						<div
							key={message.id}
							className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
						>
							<div
								className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
									message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
								}`}
							>
								{message.role === "user" ? (
									<User className="h-4 w-4" />
								) : (
									<Bot className="h-4 w-4" />
								)}
							</div>
							<div
								className={`px-3 py-2 max-w-[80%] ${
									message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
								}`}
							>
								<p className="text-sm whitespace-pre-wrap">{message.content}</p>
								<p
									className={`mt-1 text-xs ${
										message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
									}`}
								>
									{message.timestamp.toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
							</div>
						</div>
					))}

					{isLoading && (
						<div className="flex gap-3">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
								<Bot className="h-4 w-4" />
							</div>
							<div className="bg-muted px-3 py-2">
								<div className="flex gap-1">
									<span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
									<span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.1s]" />
									<span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.2s]" />
								</div>
							</div>
						</div>
					)}

					<div ref={messagesEndRef} />
				</div>

				{/* Suggestions */}
				{messages.length === 1 && (
					<div className="border-t px-4 py-3">
						<p className="text-xs text-muted-foreground mb-2">Suggestions</p>
						<div className="flex flex-wrap gap-2">
							{["Show me my recent activity", "Generate a report", "Help me with settings"].map(
								(suggestion) => (
									<button
										key={suggestion}
										type="button"
										onClick={() => setInput(suggestion)}
										className="rounded-full border px-3 py-1 text-xs hover:bg-accent"
									>
										{suggestion}
									</button>
								),
							)}
						</div>
					</div>
				)}

				{/* Input */}
				<form onSubmit={handleSubmit} className="border-t p-4">
					<div className="flex gap-2">
						<textarea
							ref={inputRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Ask me anything..."
							rows={1}
							className="flex-1 resize-none border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
						/>
						<button
							type="submit"
							disabled={!input.trim() || isLoading}
							className="bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
						>
							<Send className="h-4 w-4" />
						</button>
					</div>
					<p className="mt-2 text-xs text-muted-foreground text-center">
						Press Enter to send, Shift+Enter for new line
					</p>
				</form>
			</div>
		</>
	);
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

/**
 * Hook to manage chat state
 */
export function useChat() {
	const [isOpen, setIsOpen] = useState(false);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

	return { isOpen, open, close, toggle };
}
