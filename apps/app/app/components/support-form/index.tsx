import { Button, Input, Textarea } from "@repo/ui";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

type Priority = "low" | "normal" | "high" | "urgent";
type Category = "general" | "billing" | "technical" | "feature" | "bug";

interface SupportFormProps {
	className?: string;
	onSubmit?: (data: {
		subject: string;
		category: Category;
		priority: Priority;
		message: string;
	}) => Promise<void>;
}

const priorities: { value: Priority; label: string }[] = [
	{ value: "low", label: "Low" },
	{ value: "normal", label: "Normal" },
	{ value: "high", label: "High" },
	{ value: "urgent", label: "Urgent" },
];

const categories: { value: Category; label: string }[] = [
	{ value: "general", label: "General" },
	{ value: "billing", label: "Billing" },
	{ value: "technical", label: "Technical" },
	{ value: "feature", label: "Feature Request" },
	{ value: "bug", label: "Bug Report" },
];

export function SupportForm({ className, onSubmit }: SupportFormProps) {
	const [subject, setSubject] = useState("");
	const [category, setCategory] = useState<Category>("general");
	const [priority, setPriority] = useState<Priority>("normal");
	const [message, setMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!subject.trim()) newErrors.subject = "Subject is required";
		if (!message.trim()) newErrors.message = "Message is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		setIsSubmitting(true);
		try {
			await onSubmit?.({ subject, category, priority, message });
			setSubmitted(true);
			setSubject("");
			setCategory("general");
			setPriority("normal");
			setMessage("");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<div className={cn("border p-8 text-center", className)}>
				<h3 className="text-lg font-medium">Support ticket submitted</h3>
				<p className="mt-2 text-sm text-muted-foreground">
					We'll get back to you as soon as possible.
				</p>
				<button
					type="button"
					onClick={() => setSubmitted(false)}
					className="mt-4 text-sm text-primary hover:underline"
				>
					Submit another ticket
				</button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
			<div>
				<label htmlFor="subject" className="text-sm font-medium">
					Subject
				</label>
				<Input
					id="subject"
					type="text"
					value={subject}
					onChange={(e) => setSubject(e.target.value)}
					placeholder="Summary of your issue"
					className={cn("mt-1", errors.subject && "border-destructive")}
				/>
				{errors.subject && <p className="mt-1 text-xs text-destructive">{errors.subject}</p>}
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label htmlFor="category" className="text-sm font-medium">
						Category
					</label>
					<select
						id="category"
						value={category}
						onChange={(e) => setCategory(e.target.value as Category)}
						className="mt-1 h-10 w-full border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					>
						{categories.map((c) => (
							<option key={c.value} value={c.value}>
								{c.label}
							</option>
						))}
					</select>
				</div>

				<div>
					<label htmlFor="priority" className="text-sm font-medium">
						Priority
					</label>
					<select
						id="priority"
						value={priority}
						onChange={(e) => setPriority(e.target.value as Priority)}
						className="mt-1 h-10 w-full border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					>
						{priorities.map((p) => (
							<option key={p.value} value={p.value}>
								{p.label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div>
				<label htmlFor="message" className="text-sm font-medium">
					Message
				</label>
				<Textarea
					id="message"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder="Describe your issue in detail..."
					rows={6}
					className={cn("mt-1 resize-none", errors.message && "border-destructive")}
				/>
				{errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
			</div>

			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
			</Button>
		</form>
	);
}
