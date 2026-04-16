# Email Workers (@repo/notifications/email-workers)

Process incoming emails at the edge with Cloudflare Email Workers.

## Setup

### 1. Enable Email Routing

In Cloudflare Dashboard → Email → Email Routing → Enable

### 2. Configure wrangler.toml

```toml
# Receive emails
[[email]]
name = "EMAIL"

# Optional: Send emails
[[send_email]]
name = "SEND_EMAIL"
destination_address = "team@company.com"
```

### 3. Install Dependencies

```bash
pnpm add postal-mime mimetext
```

## Basic Usage

```ts
import { parseEmail } from "@repo/notifications/email-workers";

export default {
  async email(message, env, ctx) {
    const email = await parseEmail(message);
    
    console.log("From:", email.from);
    console.log("To:", email.to);
    console.log("Subject:", email.subject);
    console.log("Body:", email.text);
    console.log("Attachments:", email.attachments.length);
    
    // Forward to another address
    await message.forward("team@company.com");
  },
};
```

## Email Handler with Routing

```ts
import { createEmailHandler } from "@repo/notifications/email-workers";

const handler = createEmailHandler({
  // Route by recipient address pattern
  routes: {
    "support@": async (email, message, env) => {
      // Create support ticket
      await env.DB.prepare(
        "INSERT INTO tickets (from_email, subject, body) VALUES (?, ?, ?)"
      ).bind(email.from, email.subject, email.text).run();
      
      // Forward to support team
      await message.forward("support-team@company.com");
    },
    
    "unsubscribe@": async (email, message, env) => {
      // Process unsubscribe
      await env.DB.prepare(
        "UPDATE users SET subscribed = 0 WHERE email = ?"
      ).bind(email.from).run();
      // Don't forward
    },
    
    "invoices@": async (email, message, env) => {
      // Store attachments in R2
      for (const att of email.attachments) {
        if (att.mimeType === "application/pdf") {
          await env.R2.put(`invoices/${att.filename}`, att.content);
        }
      }
    },
  },
  
  // Default handler for unmatched emails
  default: async (email, message) => {
    await message.forward("catchall@company.com");
  },
  
  // Block spam
  blocklist: ["spam@", "blocked.com"],
  
  // Error handling
  onError: async (error, message, env) => {
    console.error("Email error:", error);
    await message.forward("errors@company.com");
  },
});

export default { email: handler };
```

## Auto-Reply

```ts
import { parseEmail, createReply } from "@repo/notifications/email-workers";

export default {
  async email(message, env, ctx) {
    const email = await parseEmail(message);
    
    // Create auto-reply
    const reply = await createReply({
      from: { name: "Support", address: "support@example.com" },
      to: email.from,
      subject: `Re: ${email.subject}`,
      text: `Thanks for contacting us! We received your message and will respond within 24 hours.`,
      html: `<p>Thanks for contacting us!</p><p>We received your message and will respond within 24 hours.</p>`,
      inReplyTo: email.messageId, // For email threading
    });
    
    await message.reply(reply);
  },
};
```

## Working with Attachments

```ts
import { 
  parseEmail, 
  hasAttachments, 
  getAttachment, 
  getAttachmentsByType 
} from "@repo/notifications/email-workers";

export default {
  async email(message, env, ctx) {
    const email = await parseEmail(message);
    
    if (!hasAttachments(email)) {
      return;
    }
    
    // Get specific attachment
    const invoice = getAttachment(email, "invoice.pdf");
    if (invoice) {
      await env.R2.put(`invoices/${invoice.filename}`, invoice.content);
    }
    
    // Get all images
    const images = getAttachmentsByType(email, "image/");
    for (const img of images) {
      await env.R2.put(`images/${img.filename}`, img.content);
    }
    
    // Get all PDFs
    const pdfs = getAttachmentsByType(email, "application/pdf");
  },
};
```

## Forward with Custom Headers

```ts
import { forwardWithHeaders } from "@repo/notifications/email-workers";

export default {
  async email(message, env, ctx) {
    await forwardWithHeaders(message, "team@company.com", {
      "X-Original-To": message.to,
      "X-Forwarded-For": message.from,
      "X-Priority": "high",
    });
  },
};
```

## Reject Emails

```ts
export default {
  async email(message, env, ctx) {
    // Check sender
    if (message.from.includes("spam.com")) {
      message.setReject("Sender blocked");
      return;
    }
    
    // Check size (e.g., reject > 10MB)
    if (message.rawSize > 10 * 1024 * 1024) {
      message.setReject("Email too large");
      return;
    }
    
    // Process normally
    await message.forward("inbox@company.com");
  },
};
```

## Parsed Email Structure

```ts
interface ParsedEmail {
  from: string;           // "sender@example.com"
  to: string;             // "recipient@yourdomain.com"
  subject: string | null; // "Hello World"
  messageId: string | null;
  text: string | null;    // Plain text body
  html: string | null;    // HTML body
  headers: Record<string, string>;
  attachments: ParsedAttachment[];
  raw: ArrayBuffer;       // Original raw email
}

interface ParsedAttachment {
  filename: string | null;
  mimeType: string;
  content: ArrayBuffer;
  contentId?: string;     // For inline images
  size: number;
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `parseEmail(message)` | Parse incoming email |
| `createReply(options)` | Create reply message |
| `createEmailHandler(options)` | Create handler with routing |
| `forwardWithHeaders(message, to, headers)` | Forward with custom headers |
| `getRawEmailText(message)` | Get raw email as text |
| `getRawEmailBuffer(message)` | Get raw email as ArrayBuffer |
| `hasAttachments(email)` | Check if email has attachments |
| `getAttachment(email, filename)` | Get attachment by filename |
| `getAttachmentsByType(email, mimeType)` | Get attachments by MIME type |
| `extractEmailAddress(input)` | Extract email from "Name <email>" |
| `extractName(input)` | Extract name from "Name <email>" |

## Resources

- [Email Workers Documentation](https://developers.cloudflare.com/email-routing/email-workers/)
- [Email Routing Setup](https://developers.cloudflare.com/email-routing/get-started/)
- [Runtime API Reference](https://developers.cloudflare.com/email-routing/email-workers/runtime-api/)
