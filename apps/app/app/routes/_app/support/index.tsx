import { SupportForm } from "~/components/support-form";
import type { Route } from "./+types/index";

export async function loader({ context }: Route.LoaderArgs) {
	return {};
}

export default function SupportPage() {
	const handleSubmit = async (data: {
		subject: string;
		category: string;
		priority: string;
		message: string;
	}) => {
		// TODO: Send support ticket via API
		console.log("Support ticket:", data);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));
	};

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">Support</h1>
				<p className="text-muted-foreground">
					Need help? Submit a support ticket and we'll get back to you as soon as possible.
				</p>
			</div>

			<div className="rounded-lg border p-6">
				<SupportForm onSubmit={handleSubmit} />
			</div>

			{/* FAQ Section */}
			<div className="rounded-lg border p-6">
				<h2 className="font-semibold">Frequently Asked Questions</h2>
				<div className="mt-4 space-y-4">
					<div>
						<h3 className="text-sm font-medium">How do I reset my password?</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Go to Settings → Profile → Change Password, or use the "Forgot Password" link on the
							sign-in page.
						</p>
					</div>
					<div>
						<h3 className="text-sm font-medium">How do I invite team members?</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Go to Settings → Members and click "Invite Member" to send email invitations.
						</p>
					</div>
					<div>
						<h3 className="text-sm font-medium">How do I upgrade my plan?</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Go to Settings → Billing to view available plans and upgrade your subscription.
						</p>
					</div>
					<div>
						<h3 className="text-sm font-medium">How do I cancel my subscription?</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Go to Settings → Billing and click "Manage Subscription" to access the billing portal.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export const handle = {
	breadcrumb: "Support",
};
