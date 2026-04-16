# Embed

Embeddable components, script loaders, and postMessage communication helpers.

## Installation

```bash
pnpm add @repo/embed
```

## Iframe Embedding

### Basic Usage

```tsx
import { EmbedIframe } from "@repo/embed/iframe";

<EmbedIframe
  src="https://example.com/widget"
  width="100%"
  height={400}
  title="Widget"
/>
```

### With Message Handling

```tsx
import { EmbedIframe, useIframe } from "@repo/embed/iframe";

// Using component
<EmbedIframe
  src="https://example.com/widget"
  onMessage={(data) => console.log("Received:", data)}
  targetOrigin="https://example.com"
/>

// Using hook for more control
function MyEmbed() {
  const { ref, postMessage, isLoaded } = useIframe({
    onMessage: (data) => console.log(data),
    targetOrigin: "https://example.com",
  });

  return (
    <>
      <iframe ref={ref} src="https://example.com/widget" />
      {isLoaded && (
        <button onClick={() => postMessage({ action: "refresh" })}>
          Refresh
        </button>
      )}
    </>
  );
}
```

### Sandbox Permissions

```tsx
import { EmbedIframe, SANDBOX_PERMISSIONS, ALLOW_PERMISSIONS } from "@repo/embed/iframe";

<EmbedIframe
  src="https://example.com/widget"
  sandbox={[
    SANDBOX_PERMISSIONS.SCRIPTS,
    SANDBOX_PERMISSIONS.SAME_ORIGIN,
    SANDBOX_PERMISSIONS.FORMS,
  ]}
  allow={[
    ALLOW_PERMISSIONS.CAMERA,
    ALLOW_PERMISSIONS.MICROPHONE,
  ]}
/>
```

### Auto-Resize (from embedded content)

```ts
// Inside the iframe content
import { setupAutoResize } from "@repo/embed/iframe";

// Call on mount
setupAutoResize("https://parent-domain.com");
```

## Script Loading

### Single Script

```tsx
import { useScript } from "@repo/embed/script";

function MyComponent() {
  const { status, error } = useScript({
    src: "https://example.com/widget.js",
    onLoad: () => console.log("Loaded!"),
  });

  if (status === "loading") return <div>Loading...</div>;
  if (status === "error") return <div>Error: {error?.message}</div>;

  return <div>Widget loaded!</div>;
}
```

### Multiple Scripts

```tsx
import { useScripts } from "@repo/embed/script";

const { status, statuses, errors } = useScripts({
  scripts: [
    { src: "https://example.com/lib.js" },
    { src: "https://example.com/widget.js" },
  ],
  sequential: true, // Load in order
});
```

### Preset Widgets

```tsx
import { useScript, WIDGET_SCRIPTS } from "@repo/embed/script";

// Intercom
useScript(WIDGET_SCRIPTS.intercom("app-id"));

// Crisp
useScript(WIDGET_SCRIPTS.crisp("website-id"));

// Stripe
useScript(WIDGET_SCRIPTS.stripe());

// Analytics
useScript(WIDGET_SCRIPTS.gtag("G-XXXXXXX"));
useScript(WIDGET_SCRIPTS.plausible("example.com"));
useScript(WIDGET_SCRIPTS.fathom("SITE-ID"));

// Hotjar
useScript(WIDGET_SCRIPTS.hotjar("hjid"));

// Segment
useScript(WIDGET_SCRIPTS.segment("write-key"));
```

### Programmatic Loading

```ts
import { loadScriptAsync } from "@repo/embed/script";

await loadScriptAsync({
  src: "https://example.com/widget.js",
  async: true,
});
```

## PostMessage Communication

### Basic Channel

```ts
import { createMessageChannel } from "@repo/embed/messaging";

// In parent window
const channel = createMessageChannel(iframe.contentWindow, {
  allowedOrigins: ["https://widget.example.com"],
  typePrefix: "myapp",
  debug: true,
});

// Send message
channel.send("init", { userId: "123" });

// Subscribe to messages
const unsubscribe = channel.subscribe("ready", (payload) => {
  console.log("Widget ready:", payload);
});

// Cleanup
channel.destroy();
```

### Request/Response Pattern

```ts
// Parent window
const data = await channel.request("getData", { id: "123" }, {
  timeout: 5000,
});

// In iframe
const parentChannel = createParentChannel({ typePrefix: "myapp" });

parentChannel.onRequest("getData", async (payload) => {
  const result = await fetchData(payload.id);
  return result;
});
```

### Parent/Child Helpers

```ts
import { createParentChannel, createChildChannel } from "@repo/embed/messaging";

// From inside iframe - communicate with parent
const parentChannel = createParentChannel({
  allowedOrigins: ["https://parent.com"],
});

// From parent - communicate with iframe
const childChannel = createChildChannel(iframeElement, {
  allowedOrigins: ["https://widget.com"],
});
```

### Broadcast Channel (Same-Origin Tabs)

```ts
import { createBroadcastChannel } from "@repo/embed/messaging";

const broadcast = createBroadcastChannel("my-app");

// Send to all tabs
broadcast.send("sync", { data: "updated" });

// Listen in all tabs
broadcast.subscribe("sync", (payload) => {
  console.log("Sync received:", payload);
});

broadcast.close();
```

### Type-Safe Messages

```ts
import { defineMessages, createMessageChannel } from "@repo/embed/messaging";

// Define message types
type Messages = {
  init: { userId: string };
  ready: { version: string };
  error: { code: number; message: string };
};

const messages = defineMessages<Messages>();
const channel = createMessageChannel(target);

// Type-safe sender
const sendInit = messages.sender(channel, "init");
sendInit({ userId: "123" }); // Type-checked!

// Type-safe subscriber
const onReady = messages.subscriber(channel, "ready");
onReady((payload) => {
  console.log(payload.version); // Type-checked!
});
```

## Common Patterns

### Embed with Loading State

```tsx
import { useState } from "react";
import { EmbedIframe } from "@repo/embed/iframe";

function Widget() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative">
      {loading && <div className="absolute inset-0 bg-gray-100">Loading...</div>}
      <EmbedIframe
        src="https://example.com/widget"
        onLoad={() => setLoading(false)}
        style={{ opacity: loading ? 0 : 1 }}
      />
    </div>
  );
}
```

### Lazy Load Widget on Interaction

```tsx
import { useState } from "react";
import { useScript, WIDGET_SCRIPTS } from "@repo/embed/script";

function ChatWidget() {
  const [enabled, setEnabled] = useState(false);
  const { status } = useScript({
    ...WIDGET_SCRIPTS.intercom("app-id"),
    enabled,
  });

  if (!enabled) {
    return <button onClick={() => setEnabled(true)}>Open Chat</button>;
  }

  return status === "ready" ? <div>Chat loaded!</div> : <div>Loading...</div>;
}
```
