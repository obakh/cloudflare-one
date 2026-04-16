import type { Route } from "./+types/webhook.stripe";
// import { createPayments } from "~/lib/payments.server";
// import { getEnv } from "~/lib/env";

export async function action({ request, context }: Route.ActionArgs) {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	const signature = request.headers.get("stripe-signature");
	if (!signature) {
		return new Response("Missing signature", { status: 400 });
	}

	const body = await request.text();

	// TODO: Verify webhook with real Stripe integration
	// const env = getEnv(context);
	// const payments = createPayments(env);
	// const event = await payments.verifyWebhook(body, signature);

	// Placeholder event parsing
	let event: { type: string; data: { object: Record<string, unknown> } };
	try {
		event = JSON.parse(body);
	} catch {
		return new Response("Invalid payload", { status: 400 });
	}

	// Handle different event types
	// These would update the database with subscription status
	switch (event.type) {
		case "checkout.session.completed": {
			// const session = event.data.object;
			// await db.update(teams).set({ stripeCustomerId: session.customer });
			console.log("Checkout completed");
			break;
		}
		case "customer.subscription.created":
		case "customer.subscription.updated": {
			// const subscription = event.data.object;
			// await db.update(teams).set({
			//   subscriptionId: subscription.id,
			//   subscriptionStatus: subscription.status,
			//   planId: subscription.items.data[0].price.id,
			// });
			console.log("Subscription updated");
			break;
		}
		case "customer.subscription.deleted": {
			// await db.update(teams).set({
			//   subscriptionStatus: "cancelled",
			//   planId: "free",
			// });
			console.log("Subscription cancelled");
			break;
		}
		case "invoice.paid": {
			// Record successful payment
			console.log("Invoice paid");
			break;
		}
		case "invoice.payment_failed": {
			// Handle failed payment - notify user
			console.log("Payment failed");
			break;
		}
		default:
			console.log(`Unhandled event type: ${event.type}`);
	}

	return new Response("ok", { status: 200 });
}
