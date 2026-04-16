# Email Inbox Integration

The `@repo/inbox` package provides email inbox connectors for Gmail and Outlook. Fetch attachments (receipts, invoices, documents) from user email accounts via OAuth.

## Installation

The package is included in the monorepo. Add it as a dependency:

```json
{
  "dependencies": {
    "@repo/inbox": "workspace:*"
  }
}
```

## Environment Variables

### Gmail

```env
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=https://your-app.com/api/inbox/gmail/callback
```

### Outlook

```env
OUTLOOK_CLIENT_ID=your-client-id
OUTLOOK_CLIENT_SECRET=your-client-secret
OUTLOOK_REDIRECT_URI=https://your-app.com/api/inbox/outlook/callback
```

## Quick Start

### Using the Connector (Recommended)

```ts
import { createInboxConnector } from "@repo/inbox";
import { encrypt, decrypt } from "@repo/security/encryption";

// Create connector
const inbox = createInboxConnector("gmail", {
  clientId: env.GMAIL_CLIENT_ID,
  clientSecret: env.GMAIL_CLIENT_SECRET,
  redirectUri: env.GMAIL_REDIRECT_URI,
});

// 1. Get OAuth URL
const authUrl = await inbox.getAuthUrl(encryptedState);
// Redirect user to authUrl

// 2. Handle callback - connect account
const result = await inbox.connect(code);
// result: { externalId, email, name, tokens, provider }

// Save to database with encrypted tokens
await db.createInboxAccount({
  externalId: result.externalId,
  email: result.email,
  provider: result.provider,
  accessToken: await encrypt(result.tokens.accessToken, key),
  refreshToken: await encrypt(result.tokens.refreshToken!, key),
  expiresAt: new Date(result.tokens.expiresAt!).toISOString(),
});

// 3. Sync attachments
const { attachments, syncedAt } = await inbox.sync(accountId, {
  getTokens: async (id) => {
    const account = await db.getInboxAccount(id);
    return {
      accessToken: await decrypt(account.accessToken, key),
      refreshToken: await decrypt(account.refreshToken, key),
      expiresAt: new Date(account.expiresAt).getTime(),
    };
  },
  saveTokens: async (id, tokens) => {
    await db.updateInboxAccount(id, {
      accessToken: await encrypt(tokens.accessToken, key),
      refreshToken: tokens.refreshToken
        ? await encrypt(tokens.refreshToken, key)
        : undefined,
      expiresAt: tokens.expiresAt
        ? new Date(tokens.expiresAt).toISOString()
        : undefined,
    });
  },
  getLastSynced: async (id) => {
    const account = await db.getInboxAccount(id);
    return account.lastSyncedAt ? new Date(account.lastSyncedAt) : undefined;
  },
  updateLastSynced: async (id, syncedAt) => {
    await db.updateInboxAccount(id, { lastSyncedAt: syncedAt.toISOString() });
  },
});

// Process attachments
for (const attachment of attachments) {
  console.log(attachment.filename, attachment.mimeType, attachment.size);
  // attachment.data is Uint8Array - upload to storage, process, etc.
}
```

### Direct Provider Usage

For more control, use providers directly:

```ts
import { GmailProvider } from "@repo/inbox/gmail";
import { OutlookProvider } from "@repo/inbox/outlook";

// Gmail
const gmail = new GmailProvider({
  clientId: env.GMAIL_CLIENT_ID,
  clientSecret: env.GMAIL_CLIENT_SECRET,
  redirectUri: env.GMAIL_REDIRECT_URI,
});

// Set tokens
gmail.setTokens({
  accessToken: decryptedAccessToken,
  refreshToken: decryptedRefreshToken,
  expiresAt: expiryTimestamp,
});

// Listen for token refresh
gmail.onTokenRefresh = async (tokens) => {
  await saveTokensToDatabase(tokens);
};

// Fetch attachments
const attachments = await gmail.getAttachments({
  maxResults: 50,
  after: new Date("2024-01-01"),
  mimeTypes: ["application/pdf"],
});
```

## OAuth Flow

### 1. Generate State

Use encrypted state to prevent CSRF and pass context:

```ts
import { encryptOAuthState } from "@repo/security/encryption";

const state = await encryptOAuthState(
  {
    provider: "gmail",
    teamId: "team-123",
    returnTo: "/settings/integrations",
  },
  env.ENCRYPTION_KEY
);

const authUrl = await inbox.getAuthUrl(state);
```

### 2. Handle Callback

```ts
import { decryptOAuthState } from "@repo/security/encryption";

// In callback handler
const state = await decryptOAuthState(params.state, env.ENCRYPTION_KEY);
if (!state) {
  return new Response("Invalid state", { status: 400 });
}

const result = await inbox.connect(params.code);
// Use state.teamId, state.returnTo, etc.
```

## Sync Options

```ts
interface SyncOptions {
  // Maximum messages to fetch (default: 50)
  maxResults?: number;

  // Only fetch messages after this date
  after?: Date;

  // Filter by MIME types (default: PDF only)
  mimeTypes?: string[];

  // Ignore lastSyncedAt and do full sync
  fullSync?: boolean;
}
```

## Attachment Structure

```ts
interface EmailAttachment {
  id: string; // Deterministic ID for deduplication
  filename: string; // Original filename
  mimeType: string; // MIME type
  size: number; // Size in bytes
  data: Uint8Array; // Raw attachment data
  messageId: string; // Email message ID
  senderEmail?: string; // Sender email address
  senderDomain?: string; // Root domain (e.g., "example.com")
  subject?: string; // Email subject
  receivedAt?: string; // ISO timestamp
}
```

## Error Handling

```ts
import { InboxError } from "@repo/inbox";

try {
  const attachments = await inbox.sync(accountId, tokenManager);
} catch (error) {
  if (error instanceof InboxError) {
    switch (error.code) {
      case "TOKEN_EXPIRED":
        // User needs to re-authenticate
        break;
      case "UNAUTHORIZED":
        // Invalid credentials
        break;
      case "RATE_LIMITED":
        // Too many requests
        break;
      case "PROVIDER_ERROR":
        // Provider API error
        break;
    }
  }
}
```

## Utilities

```ts
import {
  extractEmail,
  extractDomain,
  ensureFileExtension,
  isSupportedMimeType,
  isAuthenticationError,
  generateDeterministicId,
} from "@repo/inbox";

// Extract email from "Name <email@example.com>"
const email = extractEmail("John Doe <john@example.com>");
// "john@example.com"

// Get root domain
const domain = extractDomain("john@mail.example.com");
// "example.com"

// Ensure correct extension
const filename = ensureFileExtension("document", "application/pdf");
// "document.pdf"

// Check if MIME type is supported
const supported = isSupportedMimeType("application/pdf");
// true

// Generate deterministic ID for deduplication
const id = await generateDeterministicId("message-123_invoice.pdf");
// "a1b2c3d4e5f6g7h8"
```

## Database Schema Example

```sql
CREATE TABLE inbox_accounts (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'gmail' | 'outlook'
  external_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  access_token TEXT NOT NULL, -- encrypted
  refresh_token TEXT NOT NULL, -- encrypted
  expires_at TIMESTAMP,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, provider, external_id)
);
```

## Security Considerations

1. **Always encrypt tokens** - Use `@repo/security/encryption` for OAuth tokens
2. **Validate OAuth state** - Prevent CSRF with encrypted state
3. **Limit scopes** - Request only necessary permissions
4. **Handle token refresh** - Tokens expire, handle refresh gracefully
5. **Rate limiting** - Respect provider rate limits
