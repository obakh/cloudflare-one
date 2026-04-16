/**
 * @repo/chat - Real-time chat with Durable Objects
 *
 * Provides reusable chat room infrastructure using Cloudflare Durable Objects
 * with WebSocket Hibernation for efficient connection management.
 *
 * @example Server setup
 * ```ts
 * // worker.ts
 * import { ChatRoom, ChatRateLimiter, routeToRoom, createPrivateRoom } from "@repo/chat";
 *
 * // Export Durable Object classes
 * export { ChatRoom, ChatRateLimiter };
 *
 * export default {
 *   async fetch(request: Request, env: Env) {
 *     const url = new URL(request.url);
 *     const path = url.pathname.split("/").filter(Boolean);
 *
 *     // POST /api/room - Create private room
 *     if (path[0] === "api" && path[1] === "room" && !path[2]) {
 *       if (request.method === "POST") {
 *         const id = createPrivateRoom(env.rooms);
 *         return new Response(id.toString());
 *       }
 *     }
 *
 *     // /api/room/:name/websocket - Connect to room
 *     if (path[0] === "api" && path[1] === "room" && path[2]) {
 *       return routeToRoom(env.rooms, path[2], request);
 *     }
 *
 *     return new Response("Not found", { status: 404 });
 *   },
 * };
 * ```
 *
 * @example wrangler.toml
 * ```toml
 * name = "chat-app"
 * main = "src/worker.ts"
 *
 * [durable_objects]
 * bindings = [
 *   { name = "rooms", class_name = "ChatRoom" },
 *   { name = "limiters", class_name = "ChatRateLimiter" }
 * ]
 *
 * [[migrations]]
 * tag = "v1"
 * new_sqlite_classes = ["ChatRoom", "ChatRateLimiter"]
 * ```
 *
 * @example Client usage
 * ```ts
 * import { createChatClient, buildChatUrlFromLocation } from "@repo/chat/client";
 *
 * const client = createChatClient({
 *   url: buildChatUrlFromLocation("general"),
 *   name: "Alice",
 *   onMessage: (msg) => console.log(`${msg.name}: ${msg.message}`),
 * });
 *
 * client.connect();
 * client.send("Hello!");
 * ```
 */

// Rate Limiter (from @repo/security)
export {
	CHAT_RATE_LIMIT_DEFAULTS,
	ChatRateLimiter,
	createRateLimiterClient,
	createRateLimiterClientFromId,
	getIPFromRequest,
	getRateLimiterId,
	RateLimiterClient,
} from "./rate-limiter/index";
// Room
export { ChatRoom, createPrivateRoom, getRoomId, routeToRoom } from "./room";

// Types
export type {
	ChatEnv,
	ChatMessage,
	ChatRoomOptions,
	ChatSession,
	ClientChatMessage,
	ClientJoinMessage,
	ClientMessage,
	ErrorMessage,
	JoinMessage,
	LeaveMessage,
	RateLimiterOptions,
	ReadyMessage,
	RosterMessage,
	ServerMessage,
	SessionAttachment,
} from "./types";
