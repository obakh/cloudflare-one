import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { Textarea } from "@repo/ui/textarea";
import { useToast } from "@repo/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function meta() {
	return [
		{ title: "Support" },
		{ name: "description", content: "Get help with Midday" },
	];
}

export default function Support() {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		fullName: "",
		subject: "",
		type: "",
		priority: "",
		message: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// TODO: Implement your form submission logic here
			// For now, just simulate a submission
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast({
				duration: 2500,
				title: "Support ticket sent.",
				variant: "default",
			});

			setFormData({
				email: "",
				fullName: "",
				subject: "",
				type: "",
				priority: "",
				message: "",
			});
		} catch (error) {
			toast({
				duration: 3500,
				variant: "destructive",
				title: "Something went wrong please try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="max-w-[750px] m-auto">
			<h1 className="mt-24 font-medium text-center text-5xl mb-16 leading-snug">
				Support
			</h1>

			<form onSubmit={handleSubmit} className="space-y-8">
				<div className="flex space-x-4">
					<div className="w-full">
						<label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Email
						</label>
						<Input
							id="email"
							type="email"
							placeholder="Email"
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							required
							className="mt-2"
						/>
					</div>

					<div className="w-full">
						<label htmlFor="fullName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Full Name
						</label>
						<Input
							id="fullName"
							type="text"
							placeholder="John Doe"
							value={formData.fullName}
							onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
							required
							className="mt-2"
						/>
					</div>
				</div>

				<div>
					<label htmlFor="subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Subject
					</label>
					<Input
						id="subject"
						type="text"
						placeholder="Summary of the problem you have"
						value={formData.subject}
						onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
						required
						className="mt-2"
					/>
				</div>

				<div className="flex space-x-4">
					<div className="w-full">
						<label htmlFor="type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Product
						</label>
						<Select
							value={formData.type}
							onValueChange={(value) => setFormData({ ...formData, type: value })}
						>
							<SelectTrigger className="mt-2">
								<SelectValue placeholder="Select Product" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Transactions">Transactions</SelectItem>
								<SelectItem value="Vault">Vault</SelectItem>
								<SelectItem value="Inbox">Inbox</SelectItem>
								<SelectItem value="Invoicing">Invoicing</SelectItem>
								<SelectItem value="Tracker">Tracker</SelectItem>
								<SelectItem value="AI">AI</SelectItem>
								<SelectItem value="General">General</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="w-full">
						<label htmlFor="priority" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Severity
						</label>
						<Select
							value={formData.priority}
							onValueChange={(value) => setFormData({ ...formData, priority: value })}
						>
							<SelectTrigger className="mt-2">
								<SelectValue placeholder="Select severity" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="low">Low</SelectItem>
								<SelectItem value="normal">Normal</SelectItem>
								<SelectItem value="high">High</SelectItem>
								<SelectItem value="urgent">Urgent</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div>
					<label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Message
					</label>
					<Textarea
						id="message"
						placeholder="Describe the issue you're facing, along with any relevant information. Please be as detailed and specific as possible."
						className="resize-none min-h-[150px] mt-2"
						value={formData.message}
						onChange={(e) => setFormData({ ...formData, message: e.target.value })}
						required
					/>
				</div>

				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
				</Button>
			</form>
		</div>
	);
}
