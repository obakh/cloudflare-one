# Real-time Chat with WebSocket Hibernation

The `@repo/chat` package provides reusable chat room infrastructure using Cloudflare Durable Objects with WebSocket Hibernation for efficient, scalable real-time communication.

## Features

- WebSocket Hibernation API for cost-efficient idle connections
- Per-IP rate limiting via `@repo/security` Durable Objects
- Persistent chat history
- Public and private rooms
- Automatic reconnection on client

## Setup

### 1. Configure wrangler.toml

```toml
name = "my-chat-app"
main = "src/worker.ts"
compatibility_date = "2025-01-01"

[durable_objects]
bindings = [
  { name = "rooms", class_name = "ChatRoom" },
  { name = "limiters", class_name = "RateLimiterDO" }
]

[[migrations]]
tag = "v1"
new_sqlite_classes = ["ChatRoom", "RateLimiterDO"]
```

### 2. Create Worker

```ts
// src/worker.ts
import {
  ChatRoom,
  routeToRoom,
  createPrivateRoom,
} from "@repo/chat";
import { RateLimiterDO } from "@repo/security/rate-limit/durable-object";

// Export Durable Object classes (required!)
export { ChatRoom };
export { RateLimiterDO };

interface Env {
  rooms: DurableObjectNamespace;
  limiters: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.split("/").filter(Boolean);

    // Serve static HTML at root
    if (!path.length) {
      return new Response(HTML, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // API routes
    if (path[0] === "api") {
      // POST /api/room - Create private room
      if (path[1] === "room" && !path[2] && request.method === "POST") {
        const id = createPrivateRoom(env.rooms);
        return new Response(id.toString(), {
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }

      // /api/room/:name/websocket - Connect to room
      if (path[1] === "room" && path[2]) {
        return routeToRoom(env.rooms, path[2], request);
      }
    }

    return new Response("Not found", { status: 404 });
  },
};
```

### 3. Client Connection

```ts
import { createChatClient, buildChatUrl } from "@repo/chat/client";

const client = createChatClient({
  url: buildChatUrl("https://my-chat.workers.dev", "general"),
  name: "Alice",
  onMessage: (msg) => {
    console.log(`${msg.name}: ${msg.message}`);
  },
  onUserJoin: (name) => console.log(`${name} joined`),
  onUserLeave: (name) => console.log(`${name} left`),
  onError: (err) => console.error(err),
});

client.connect();

// Send a message
client.send("Hello everyone!");

// Disconnect
client.disconnect();
```

## API Reference

### Server

#### `ChatRoom`

Durable Object class for managing a chat room.

```ts
export { ChatRoom } from "@repo/chat";
```

Options (passed via constructor):
- `maxMessageLength` - Max message length (default: 256)
- `maxNameLength` - Max username length (default: 32)
- `historyLimit` - Messages to load from history (default: 100)
- `validateMessage` - Custom message validator
- `validateName` - Custom name validator
- `onMessage` - Callback when message sent
- `onJoin` - Callback when user joins
- `onLeave` - Callback when user leaves

#### `ChatRateLimiter` (alias for `RateLimiterDO`)

Re-exported from `@repo/security/rate-limit/durable-object` for convenience.

```ts
// These are equivalent:
import { ChatRateLimiter } from "@repo/chat";
import { RateLimiterDO } from "@repo/security/rate-limit/durable-object";
```

Options (via query params or client options):
- `cooldownSeconds` - Cooldown per action (default: 5)
- `gracePeriodSeconds` - Grace period (default: 20)

#### `routeToRoom(rooms, roomName, request)`

Route a request to a chat room.

```ts
import { routeToRoom } from "@repo/chat";

// In your fetch handler
return routeToRoom(env.rooms, "general", request);
```

#### `createPrivateRoom(rooms)`

Create a new private room with a unique ID.

```ts
import { createPrivateRoom } from "@repo/chat";

const id = createPrivateRoom(env.rooms);
return new Response(id.toString());
```

#### `getRoomId(rooms, name)`

Get a room ID from a name (or parse hex ID).

```ts
import { getRoomId } from "@repo/chat";

const id = getRoomId(env.rooms, "general");
const room = env.rooms.get(id);
```

### Client

#### `createChatClient(options)`

Create a chat client for browser usage.

```ts
import { createChatClient } from "@repo/chat/client";

const client = createChatClient({
  url: "wss://example.com/api/room/general/websocket",
  name: "Alice",
  autoReconnect: true,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  onConnect: () => {},
  onDisconnect: (code, reason) => {},
  onMessage: (msg) => {},
  onUserJoin: (name) => {},
  onUserLeave: (name) => {},
  onReady: () => {},
  onError: (error) => {},
  onRosterUpdate: (users) => {},
});

client.connect();
client.send("Hello!");
client.disconnect();
client.isConnected(); // boolean
client.getRoster(); // string[]
```

#### `buildChatUrl(baseUrl, roomName)`

Build a WebSocket URL for a chat room.

```ts
import { buildChatUrl } from "@repo/chat/client";

const url = buildChatUrl("https://example.com", "general");
// "wss://example.com/api/room/general/websocket"
```

#### `buildChatUrlFromLocation(roomName)`

Build a WebSocket URL from current browser location.

```ts
import { buildChatUrlFromLocation } from "@repo/chat/client";

const url = buildChatUrlFromLocation("general");
```

## Message Types

### Server → Client

```ts
// Chat message
{ type: "message", name: string, message: string, timestamp: number }

// User joined
{ type: "join", name: string }

// User left
{ type: "leave", name: string }

// Ready (after history loaded)
{ type: "ready" }

// Error
{ type: "error", error: string }

// Roster update
{ type: "roster", users: string[] }
```

### Client → Server

```ts
// Join (first message)
{ type: "join", name: string }

// Chat message
{ type: "message", message: string }
```

## Room Types

### Public Rooms

Named rooms accessible by anyone who knows the name:

```
/api/room/general/websocket
/api/room/support/websocket
```

### Private Rooms

Rooms with unique IDs (64 hex characters):

```ts
// Create
const id = createPrivateRoom(env.rooms);
// Returns: "a1b2c3d4..."

// Connect
/api/room/a1b2c3d4.../websocket
```

## WebSocket Hibernation

The package uses the WebSocket Hibernation API, which means:

1. Idle connections don't keep the Durable Object in memory
2. You only pay for active JavaScript execution time
3. Connections survive Durable Object eviction
4. State is restored via `serializeAttachment`/`deserializeAttachment`

## Rate Limiting

Each IP address gets a rate limiter Durable Object:

- 1 message per 5 seconds (configurable)
- 20 second grace period for bursts
- Shared across all rooms

## Customization

### Custom Validation

```ts
const room = new ChatRoom(state, env, {
  validateName: (name) => {
    if (name.includes("admin")) return "Reserved name";
    return true;
  },
  validateMessage: (message, session) => {
    if (message.includes("spam")) return "No spam allowed";
    return true;
  },
});
```

### Event Hooks

```ts
const room = new ChatRoom(state, env, {
  onMessage: async (msg) => {
    // Log to analytics
    await analytics.track("chat_message", { room: roomId });
  },
  onJoin: async (name) => {
    // Notify moderators
  },
  onLeave: async (name) => {
    // Cleanup
  },
});
```

## React Integration

```tsx
import { createChatClient, buildChatUrlFromLocation } from "@repo/chat/client";
import { useEffect, useState, useRef } from "react";

function useChat(roomName: string, userName: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roster, setRoster] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<ReturnType<typeof createChatClient>>();

  useEffect(() => {
    const client = createChatClient({
      url: buildChatUrlFromLocation(roomName),
      name: userName,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onMessage: (msg) => setMessages((prev) => [...prev, msg]),
      onRosterUpdate: setRoster,
    });

    client.connect();
    clientRef.current = client;

    return () => client.disconnect();
  }, [roomName, userName]);

  return {
    messages,
    roster,
    connected,
    send: (msg: string) => clientRef.current?.send(msg),
  };
}
```
