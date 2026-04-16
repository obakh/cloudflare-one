import { cn, formatDate, generateId, sleep } from "@repo/utils";
import { describe, expect, it } from "vitest";

/**
 * Unit tests for shared utilities
 * These run inside the Workers runtime
 */
describe("@repo/utils", () => {
	describe("cn", () => {
		it("merges class names", () => {
			expect(cn("foo", "bar")).toBe("foo bar");
		});

		it("handles conditional classes", () => {
			const showBar = false;
			expect(cn("foo", showBar && "bar", "baz")).toBe("foo baz");
		});

		it("handles undefined and null", () => {
			expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
		});
	});

	describe("formatDate", () => {
		it("formats date correctly", () => {
			const date = new Date("2024-01-15");
			const formatted = formatDate(date);
			expect(formatted).toContain("2024");
		});
	});

	describe("sleep", () => {
		it("delays execution", async () => {
			const start = Date.now();
			await sleep(50);
			const elapsed = Date.now() - start;
			expect(elapsed).toBeGreaterThanOrEqual(45);
		});
	});

	describe("generateId", () => {
		it("generates unique ids", () => {
			const id1 = generateId();
			const id2 = generateId();
			expect(id1).not.toBe(id2);
		});

		it("generates ids of correct length", () => {
			const id = generateId();
			expect(id.length).toBeGreaterThan(0);
		});
	});
});
