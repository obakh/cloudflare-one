import { Button, Textarea } from "@repo/ui";
import { Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface FeedbackFormProps {
	className?: string;
	onSubmit?: (feedback: string) => Promise<void>;
}

export function FeedbackForm({ className, onSubmit }: FeedbackFormProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [value, setValue] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = async () => {
		if (!value.trim()) return;

		setIsSubmitting(true);
		try {
			await onSubmit?.(value);
			setValue("");
			setSubmitted(true);
			setTimeout(() => {
				setSubmitted(false);
				setIsOpen(false);
			}, 2000);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className={cn("relative", className)}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex h-8 items-center gap-2 border bg-muted/50 px-3 text-xs text-muted-foreground hover:bg-muted"
			>
				<MessageSquare className="h-3 w-3" />
				Feedback
			</button>

			{isOpen && (
				<>
					<button
						type="button"
						className="fixed inset-0 z-40"
						onClick={() => setIsOpen(false)}
						aria-label="Close feedback"
					/>
					<div className="absolute right-0 top-full z-50 mt-2 w-80 border bg-background p-4 shadow-lg">
						{submitted ? (
							<div className="flex flex-col items-center justify-center space-y-1 py-8 text-center">
								<p className="text-sm font-medium">Thank you for your feedback!</p>
								<p className="text-sm text-muted-foreground">
									We'll review it as soon as possible.
								</p>
							</div>
						) : (
							<div className="space-y-4">
								<Textarea
									value={value}
									onChange={(e) => setValue(e.target.value)}
									placeholder="Ideas to improve this page or issues you're experiencing..."
									className="h-28 resize-none"
								/>
								<div className="flex justify-end">
									<Button onClick={handleSubmit} disabled={!value.trim() || isSubmitting}>
										{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
									</Button>
								</div>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
