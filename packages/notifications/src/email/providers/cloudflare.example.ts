/**
 * Cloudflare Email Sending Examples
 *
 * This file demonstrates various ways to use the Cloudflare Email Service provider.
 */

import { createEmailClient } from "../index";
import { createCloudflareProvider } from "./cloudflare";

// Example 1: Using REST API
export async function exampleRestApi(env: {
	CLOUDFLARE_ACCOUNT_ID: string;
	CLOUDFLARE_API_TOKEN: string;
}) {
	const email = createEmailClient(
		createCloudflareProvider({
			accountId: env.CLOUDFLARE_ACCOUNT_ID,
			apiToken: env.CLOUDFLARE_API_TOKEN,
		}),
	);

	const result = await email.send({
		from: "welcome@yourdomain.com",
		to: "user@example.com",
		subject: "Welcome to our service!",
		html: "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
		text: "Welcome! Thanks for signing up.",
	});

	console.log("Email sent:", result);
}

// Example 2: Using Workers binding
export async function exampleWorkersBinding(env: { EMAIL: any }) {
	const email = createEmailClient(
		createCloudflareProvider({
			binding: env.EMAIL,
		}),
	);

	const result = await email.send({
		from: "notifications@yourdomain.com",
		to: "user@example.com",
		subject: "Your weekly digest",
		html: "<h1>Weekly Digest</h1><p>Here's what happened this week...</p>",
	});

	console.log("Email sent:", result);
}

// Example 3: Using React Email templates
export async function exampleReactEmail(env: { EMAIL: any }) {
	const email = createEmailClient(
		createCloudflareProvider({
			binding: env.EMAIL,
		}),
	);

	// Import your React Email template
	// import { WelcomeEmail } from "@repo/notifications/email/templates";

	const result = await email.send({
		from: "hello@yourdomain.com",
		to: "user@example.com",
		subject: "Welcome!",
		// react: <WelcomeEmail name="John" appName="Acme" />,
	});

	console.log("Email sent:", result);
}

// Example 4: Multiple recipients with CC and BCC
export async function exampleMultipleRecipients(env: { EMAIL: any }) {
	const email = createEmailClient(
		createCloudflareProvider({
			binding: env.EMAIL,
		}),
	);

	const result = await email.send({
		from: "team@yourdomain.com",
		to: ["user1@example.com", "user2@example.com"],
		cc: "manager@example.com",
		bcc: "archive@yourdomain.com",
		subject: "Team Update",
		html: "<h1>Team Update</h1><p>Important announcement...</p>",
	});

	console.log("Email sent:", result);
}

// Example 5: Custom headers for tracking and list management
export async function exampleCustomHeaders(env: { EMAIL: any }) {
	const email = createEmailClient(
		createCloudflareProvider({
			binding: env.EMAIL,
		}),
	);

	const result = await email.send({
		from: "newsletter@yourdomain.com",
		to: "subscriber@example.com",
		subject: "Your weekly newsletter",
		html: "<h1>Newsletter</h1><p>This week's content...</p>",
		headers: {
			"List-Unsubscribe": "<https://yourdomain.com/unsubscribe?id=abc123>",
			"List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
			"X-Campaign-ID": "weekly-newsletter-2026-04",
		},
	});

	console.log("Email sent:", result);
}

// Example 6: With sender restrictions
export async function exampleSenderRestrictions(env: { EMAIL: any }) {
	const email = createEmailClient(
		createCloudflareProvider({
			binding: env.EMAIL,
			allowedSenderAddresses: ["noreply@yourdomain.com", "support@yourdomain.com"],
		}),
	);

	// This will succeed
	const result1 = await email.send({
		from: "noreply@yourdomain.com",
		to: "user@example.com",
		subject: "Allowed sender",
		text: "This email is from an allowed sender.",
	});

	// This will fail
	const result2 = await email.send({
		from: "unauthorized@yourdomain.com",
		to: "user@example.com",
		subject: "Unauthorized sender",
		text: "This will not be sent.",
	});

	console.log("Result 1:", result1);
	console.log("Result 2:", result2);
}

// Example 7: Error handling
export async function exampleErrorHandling(env: { EMAIL: any }) {
	const email = createEmailClient(
		createCloudflareProvider({
			binding: env.EMAIL,
		}),
	);

	const result = await email.send({
		from: "sender@yourdomain.com",
		to: "user@example.com",
		subject: "Test Email",
		text: "Testing error handling",
	});

	if (!result.success) {
		console.error("Failed to send email:", result.error);

		// Handle specific error types
		if (result.error?.includes("E_SENDER_NOT_VERIFIED")) {
			console.error("Please verify your sender domain first");
		} else if (result.error?.includes("E_RATE_LIMIT_EXCEEDED")) {
			console.error("Rate limit exceeded. Please try again later");
		}
	} else {
		console.log("Email sent successfully:", result.id);
	}
}

// Example 8: Batch sending
export async function exampleBatchSending(env: { EMAIL: any }) {
	const email = createEmailClient(
		createCloudflareProvider({
			binding: env.EMAIL,
		}),
	);

	const results = await email.sendBatch([
		{
			from: "notifications@yourdomain.com",
			to: "user1@example.com",
			subject: "Welcome!",
			text: "Welcome to our service, User 1!",
		},
		{
			from: "notifications@yourdomain.com",
			to: "user2@example.com",
			subject: "Welcome!",
			text: "Welcome to our service, User 2!",
		},
		{
			from: "notifications@yourdomain.com",
			to: "user3@example.com",
			subject: "Welcome!",
			text: "Welcome to our service, User 3!",
		},
	]);

	console.log("Batch results:", results);
}

// Example 9: Complete Cloudflare Worker
export default {
	async fetch(request: Request, env: any): Promise<Response> {
		const email = createEmailClient(
			createCloudflareProvider({
				binding: env.EMAIL,
			}),
		);

		try {
			const result = await email.send({
				from: "welcome@yourdomain.com",
				to: "user@example.com",
				subject: "Welcome!",
				html: "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
				text: "Welcome! Thanks for signing up.",
			});

			return new Response(
				JSON.stringify({
					success: true,
					messageId: result.id,
				}),
				{
					headers: { "Content-Type": "application/json" },
				},
			);
		} catch (error) {
			return new Response(
				JSON.stringify({
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	},
};
