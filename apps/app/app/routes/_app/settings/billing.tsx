import { Button } from "@repo/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/card";
import { Check, CreditCard } from "lucide-react";
import { PLANS, type PlanId } from "~/lib/payments.server";
import type { Route } from "./+types/billing";

// Convert PLANS to array for rendering
const plansArray = Object.values(PLANS).map((plan) => ({
	...plan,
	popular: plan.id === "pro",
}));

export async function loader({ request, context }: Route.LoaderArgs) {
	// Mock data for development
	return {
		subscription: {
			plan: "pro" as PlanId,
			status: "active",
			currentPeriodEnd: "2024-07-15",
			cancelAtPeriodEnd: false,
			stripeCustomerId: "cus_xxx",
		},
		paymentMethod: {
			brand: "visa",
			last4: "4242",
			expMonth: 12,
			expYear: 2025,
		},
		invoices: [
			{ id: "inv_1", date: "2024-06-01", amount: 29, status: "paid" },
			{ id: "inv_2", date: "2024-05-01", amount: 29, status: "paid" },
			{ id: "inv_3", date: "2024-04-01", amount: 29, status: "paid" },
		],
		plans: plansArray,
	};
}

export async function action({ request, context }: Route.ActionArgs) {
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "upgrade") {
		const planId = formData.get("planId") as PlanId;
		const plan = PLANS[planId];

		if (!plan?.priceId) {
			return { error: "Invalid plan" };
		}

		return { success: true, message: "Upgrade initiated" };
	}

	if (intent === "manage") {
		return { success: true, message: "Portal session created" };
	}

	if (intent === "cancel") {
		return { success: true, message: "Subscription cancelled" };
	}

	return { error: "Invalid action" };
}

export default function BillingSettings({ loaderData }: Route.ComponentProps) {
	const { subscription, paymentMethod, invoices, plans } = loaderData;

	return (
		<div className="space-y-6">
			{/* Current Plan Card */}
			<Card>
				<CardHeader>
					<CardTitle>Current plan</CardTitle>
					<CardDescription>
						You are currently on the{" "}
						<span className="font-medium capitalize">{subscription.plan}</span> plan.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground">
								Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
							</p>
						</div>
						<span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success capitalize">
							{subscription.status}
						</span>
					</div>
				</CardContent>
				<CardFooter>
					<form method="post">
						<input type="hidden" name="intent" value="manage" />
						<Button type="submit" variant="outline">
							Manage Subscription
						</Button>
					</form>
				</CardFooter>
			</Card>

			{/* Plans Card */}
			<Card>
				<CardHeader>
					<CardTitle>Available plans</CardTitle>
					<CardDescription>Choose the plan that best fits your needs.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						{plans.map(
							(plan: {
								id: string;
								name: string;
								price: number;
								features: string[];
								popular?: boolean;
							}) => (
								<div
									key={plan.id}
									className={`relative border p-4 ${
										plan.popular ? "border-primary ring-1 ring-primary" : ""
									}`}
								>
									{plan.popular && (
										<span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
											Popular
										</span>
									)}
									<h4 className="font-medium">{plan.name}</h4>
									<div className="mt-2">
										<span className="text-2xl font-bold">${plan.price}</span>
										<span className="text-muted-foreground">/month</span>
									</div>
									<ul className="mt-4 space-y-2">
										{plan.features.map((feature: string) => (
											<li key={feature} className="flex items-center gap-2 text-sm">
												<Check className="h-4 w-4 text-success" />
												{feature}
											</li>
										))}
									</ul>
									<form method="post" className="mt-4">
										<input type="hidden" name="intent" value="upgrade" />
										<input type="hidden" name="planId" value={plan.id} />
										<Button
											type="submit"
											disabled={subscription.plan === plan.id}
											className="w-full"
											variant={subscription.plan === plan.id ? "secondary" : "default"}
										>
											{subscription.plan === plan.id ? "Current Plan" : "Upgrade"}
										</Button>
									</form>
								</div>
							),
						)}
					</div>
				</CardContent>
			</Card>

			{/* Payment Method Card */}
			<Card>
				<CardHeader>
					<CardTitle>Payment method</CardTitle>
					<CardDescription>Manage your payment method and billing information.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-3">
						<CreditCard className="h-5 w-5 text-muted-foreground" />
						<div>
							<p className="text-sm font-medium capitalize">{paymentMethod.brand}</p>
							<p className="text-sm text-muted-foreground">
								•••• {paymentMethod.last4} · Expires {paymentMethod.expMonth}/
								{paymentMethod.expYear}
							</p>
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<Button type="button" variant="outline">
						Update
					</Button>
				</CardFooter>
			</Card>

			{/* Billing History Card */}
			<Card>
				<CardHeader>
					<CardTitle>Billing history</CardTitle>
					<CardDescription>View and download your past invoices.</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					<div className="divide-y">
						{invoices.map(
							(invoice: { id: string; date: string; amount: number; status: string }) => (
								<div key={invoice.id} className="flex items-center justify-between p-4">
									<div>
										<p className="text-sm font-medium">${invoice.amount}.00</p>
										<p className="text-sm text-muted-foreground">
											{new Date(invoice.date).toLocaleDateString()}
										</p>
									</div>
									<div className="flex items-center gap-4">
										<span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success capitalize">
											{invoice.status}
										</span>
										<button type="button" className="text-sm text-primary hover:underline">
											Download
										</button>
									</div>
								</div>
							),
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export const handle = {
	breadcrumb: "Billing",
};
