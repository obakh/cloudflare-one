/**
 * @repo/storage - Storage utilities for Cloudflare
 *
 * Supports R2 object storage and KV key-value storage.
 *
 * @example
 * ```ts
 * // R2 - Presigned URLs
 * import { createR2Client, generateUploadUrl } from "@repo/storage/r2";
 *
 * const r2 = createR2Client({
 *   accountId: env.CF_ACCOUNT_ID,
 *   accessKeyId: env.R2_ACCESS_KEY_ID,
 *   secretAccessKey: env.R2_SECRET_ACCESS_KEY,
 * });
 *
 * const uploadUrl = await generateUploadUrl(r2, {
 *   bucket: "my-bucket",
 *   key: "uploads/image.png",
 * });
 *
 * // KV - Type-safe helpers
 * import { getJson, putJson, getOrSet, createNamespacedKV } from "@repo/storage/kv";
 *
 * // Simple get/put
 * const user = await getJson<User>(env.KV, "user:123");
 * await putJson(env.KV, "user:123", { name: "John" }, { expirationTtl: 3600 });
 *
 * // Cache with compute
 * const data = await getOrSet(env.KV, "expensive:query", async () => {
 *   return await db.query(...);
 * }, { expirationTtl: 300 });
 *
 * // Namespaced KV
 * const userKV = createNamespacedKV(env.KV, "user:");
 * await userKV.put("123", { name: "John" });
 * ```
 */

export * from "./kv/index.js";
export * from "./r2/index.js";
