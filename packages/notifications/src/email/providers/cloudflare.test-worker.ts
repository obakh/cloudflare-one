/**
 * Cloudflare Email Service - Test Worker
 *
 * This is a minimal test worker to verify your Cloudflare Email Service setup.
 * Deploy this to test that everything is configured correctly.
 *
 * Setup:
 * 1. Create a new Worker or use an existing one
 * 2. Add email binding to wrangler.jsonc:
 *    {
 *      "send_email": [{ "name": "EMAIL", "remote": true }]
 *    }
 * 3. Copy this code to your Worker
 * 4. Update YOUR_DOMAIN and TEST_EMAIL
 * 5. Deploy: npm run deploy
 * 6. Visit your Worker URL to send a test email
 */

import { createEmailClient } from "../index";
import { createCloudflareProvider } from "./cloudflare";

// ⚠️ UPDATE THESE VALUES
const YOUR_DOMAIN = "yourdomain.com"; // Your verified Cloudflare domain
const TEST_EMAIL = "your-email@example.com"; // Where to send test emails

interface Env {
	EMAIL: any; // Cloudflare Email binding
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// Health check endpoint
		if (url.pathname === "/health") {
			return new Response("OK", { status: 200 });
		}

		// Test email endpoint
		if (url.pathname === "/test-email") {
			try {
				const email = createEmailClient(
					createCloudflareProvider({
						binding: env.EMAIL,
					}),
				);

				const result = await email.send({
					from: `test@${YOUR_DOMAIN}`,
					to: TEST_EMAIL,
					subject: "Cloudflare Email Service Test",
					html: `
            <h1>✅ Email Service Working!</h1>
            <p>Your Cloudflare Email Service is configured correctly.</p>
            <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
            <hr>
            <p><small>This is a test email from your Cloudflare Worker.</small></p>
          `,
					text: `
✅ Email Service Working!

Your Cloudflare Email Service is configured correctly.

Sent at: ${new Date().toISOString()}

This is a test email from your Cloudflare Worker.
          `,
				});

				if (result.success) {
					return new Response(
						JSON.stringify({
							success: true,
							message: "Test email sent successfully!",
							messageId: result.id,
							sentTo: TEST_EMAIL,
							sentFrom: `test@${YOUR_DOMAIN}`,
							timestamp: new Date().toISOString(),
						}),
						{
							status: 200,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				return new Response(
					JSON.stringify({
						success: false,
						error: result.error,
					}),
					{
						status: 500,
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
		}

		// Test multiple recipients
		if (url.pathname === "/test-multiple") {
			try {
				const email = createEmailClient(
					createCloudflareProvider({
						binding: env.EMAIL,
					}),
				);

				const result = await email.send({
					from: `test@${YOUR_DOMAIN}`,
					to: [TEST_EMAIL], // Add more emails to test multiple recipients
					subject: "Multiple Recipients Test",
					html: "<h1>Testing multiple recipients</h1>",
				});

				return new Response(JSON.stringify(result), {
					headers: { "Content-Type": "application/json" },
				});
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
		}

		// Test with custom headers
		if (url.pathname === "/test-headers") {
			try {
				const email = createEmailClient(
					createCloudflareProvider({
						binding: env.EMAIL,
					}),
				);

				const result = await email.send({
					from: `newsletter@${YOUR_DOMAIN}`,
					to: TEST_EMAIL,
					subject: "Custom Headers Test",
					html: "<h1>Testing custom headers</h1>",
					headers: {
						"X-Test-Header": "test-value",
						"X-Campaign-ID": "test-campaign-123",
					},
				});

				return new Response(JSON.stringify(result), {
					headers: { "Content-Type": "application/json" },
				});
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
		}

		// Default response with instructions
		return new Response(
			`
<!DOCTYPE html>
<html>
<head>
  <title>Cloudflare Email Service Test</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 50px auto; padding: 20px; }
    h1 { color: #f38020; }
    .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .endpoint h3 { margin-top: 0; }
    code { background: #e0e0e0; padding: 2px 6px; border-radius: 3px; }
    .button { display: inline-block; background: #f38020; color: white; padding: 10px 20px;
              text-decoration: none; border-radius: 5px; margin: 5px; }
    .button:hover { background: #d66f1a; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>🚀 Cloudflare Email Service Test Worker</h1>

  <div class="warning">
    <strong>⚠️ Before testing:</strong>
    <ol>
      <li>Update <code>YOUR_DOMAIN</code> in the worker code</li>
      <li>Update <code>TEST_EMAIL</code> in the worker code</li>
      <li>Ensure your domain is onboarded in Cloudflare Email Sending</li>
      <li>Add email binding to wrangler.jsonc</li>
    </ol>
  </div>

  <h2>Test Endpoints</h2>

  <div class="endpoint">
    <h3>1. Basic Email Test</h3>
    <p>Send a simple test email to verify your setup.</p>
    <a href="/test-email" class="button">Send Test Email</a>
  </div>

  <div class="endpoint">
    <h3>2. Multiple Recipients Test</h3>
    <p>Test sending to multiple recipients.</p>
    <a href="/test-multiple" class="button">Test Multiple Recipients</a>
  </div>

  <div class="endpoint">
    <h3>3. Custom Headers Test</h3>
    <p>Test sending with custom headers.</p>
    <a href="/test-headers" class="button">Test Custom Headers</a>
  </div>

  <div class="endpoint">
    <h3>4. Health Check</h3>
    <p>Verify the worker is running.</p>
    <a href="/health" class="button">Health Check</a>
  </div>

  <h2>Configuration</h2>
  <p><strong>Current Domain:</strong> <code>${YOUR_DOMAIN}</code></p>
  <p><strong>Test Email:</strong> <code>${TEST_EMAIL}</code></p>

  <h2>Next Steps</h2>
  <ol>
    <li>Click "Send Test Email" above</li>
    <li>Check your inbox at <code>${TEST_EMAIL}</code></li>
    <li>If you don't see the email, check spam folder</li>
    <li>Review Cloudflare Email Sending logs in the dashboard</li>
  </ol>

  <hr>
  <p><small>Powered by Cloudflare Email Service | <a href="https://developers.cloudflare.com/email-service/">Documentation</a></small></p>
</body>
</html>
    `,
			{
				headers: { "Content-Type": "text/html" },
			},
		);
	},
};
