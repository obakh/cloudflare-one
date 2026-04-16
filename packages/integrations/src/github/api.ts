/**
 * GitHub API Client for Cloudflare Workers
 *
 * @example
 * ```ts
 * import { createGitHubClient } from "@repo/integrations/github/api";
 *
 * const github = createGitHubClient(accessToken);
 *
 * // Get user repos
 * const repos = await github.repos.list();
 *
 * // Create an issue
 * await github.issues.create("owner", "repo", {
 *   title: "Bug report",
 *   body: "Description...",
 * });
 *
 * // Create a comment
 * await github.issues.createComment("owner", "repo", 123, "Thanks!");
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface GitHubClientConfig {
	accessToken: string;
	baseUrl?: string;
	apiVersion?: string;
}

export interface GitHubRepo {
	id: number;
	node_id: string;
	name: string;
	full_name: string;
	private: boolean;
	owner: { id: number; login: string; avatar_url: string };
	html_url: string;
	description: string | null;
	fork: boolean;
	default_branch: string;
	language: string | null;
	stargazers_count: number;
	watchers_count: number;
	forks_count: number;
	open_issues_count: number;
	created_at: string;
	updated_at: string;
	pushed_at: string;
}

export interface GitHubIssue {
	id: number;
	node_id: string;
	number: number;
	title: string;
	body: string | null;
	state: "open" | "closed";
	html_url: string;
	user: { id: number; login: string; avatar_url: string };
	labels: Array<{ id: number; name: string; color: string }>;
	assignees: Array<{ id: number; login: string; avatar_url: string }>;
	created_at: string;
	updated_at: string;
	closed_at: string | null;
}

export interface GitHubPullRequest {
	id: number;
	node_id: string;
	number: number;
	title: string;
	body: string | null;
	state: "open" | "closed";
	html_url: string;
	diff_url: string;
	merged: boolean;
	draft: boolean;
	head: { ref: string; sha: string };
	base: { ref: string; sha: string };
	user: { id: number; login: string; avatar_url: string };
	created_at: string;
	updated_at: string;
	merged_at: string | null;
}

export interface CreateIssueOptions {
	title: string;
	body?: string;
	labels?: string[];
	assignees?: string[];
	milestone?: number;
}

export interface CreatePROptions {
	title: string;
	body?: string;
	head: string;
	base: string;
	draft?: boolean;
	maintainer_can_modify?: boolean;
}

export interface ListOptions {
	per_page?: number;
	page?: number;
	sort?: string;
	direction?: "asc" | "desc";
}

// ============================================================================
// API Client
// ============================================================================

export interface GitHubClient {
	request<T>(method: string, path: string, body?: unknown): Promise<T>;
	repos: {
		list(options?: ListOptions): Promise<GitHubRepo[]>;
		get(owner: string, repo: string): Promise<GitHubRepo>;
		listForOrg(org: string, options?: ListOptions): Promise<GitHubRepo[]>;
	};
	issues: {
		list(
			owner: string,
			repo: string,
			options?: ListOptions & { state?: "open" | "closed" | "all" },
		): Promise<GitHubIssue[]>;
		get(owner: string, repo: string, number: number): Promise<GitHubIssue>;
		create(owner: string, repo: string, options: CreateIssueOptions): Promise<GitHubIssue>;
		update(
			owner: string,
			repo: string,
			number: number,
			options: Partial<CreateIssueOptions> & { state?: "open" | "closed" },
		): Promise<GitHubIssue>;
		createComment(
			owner: string,
			repo: string,
			number: number,
			body: string,
		): Promise<{ id: number; body: string }>;
	};
	pulls: {
		list(
			owner: string,
			repo: string,
			options?: ListOptions & { state?: "open" | "closed" | "all" },
		): Promise<GitHubPullRequest[]>;
		get(owner: string, repo: string, number: number): Promise<GitHubPullRequest>;
		create(owner: string, repo: string, options: CreatePROptions): Promise<GitHubPullRequest>;
		merge(
			owner: string,
			repo: string,
			number: number,
			options?: { commit_title?: string; merge_method?: "merge" | "squash" | "rebase" },
		): Promise<{ merged: boolean; sha: string }>;
		createReview(
			owner: string,
			repo: string,
			number: number,
			options: { body?: string; event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT" },
		): Promise<{ id: number }>;
	};
	orgs: {
		get(org: string): Promise<{ id: number; login: string; name: string; description: string }>;
		listMembers(
			org: string,
			options?: ListOptions,
		): Promise<Array<{ id: number; login: string; avatar_url: string }>>;
	};
}

export function createGitHubClient(
	accessToken: string,
	options: { baseUrl?: string; apiVersion?: string } = {},
): GitHubClient {
	const baseUrl = options.baseUrl || "https://api.github.com";
	const apiVersion = options.apiVersion || "2022-11-28";

	async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
		const response = await fetch(`${baseUrl}${path}`, {
			method,
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": apiVersion,
				...(body ? { "Content-Type": "application/json" } : {}),
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`GitHub API error ${response.status}: ${error}`);
		}

		if (response.status === 204) {
			return {} as T;
		}

		return response.json() as Promise<T>;
	}

	return {
		request,

		repos: {
			async list(opts = {}) {
				const params = new URLSearchParams();
				if (opts.per_page) params.set("per_page", String(opts.per_page));
				if (opts.page) params.set("page", String(opts.page));
				if (opts.sort) params.set("sort", opts.sort);
				if (opts.direction) params.set("direction", opts.direction);
				const query = params.toString();
				return request<GitHubRepo[]>("GET", `/user/repos${query ? `?${query}` : ""}`);
			},

			async get(owner, repo) {
				return request<GitHubRepo>("GET", `/repos/${owner}/${repo}`);
			},

			async listForOrg(org, opts = {}) {
				const params = new URLSearchParams();
				if (opts.per_page) params.set("per_page", String(opts.per_page));
				if (opts.page) params.set("page", String(opts.page));
				const query = params.toString();
				return request<GitHubRepo[]>("GET", `/orgs/${org}/repos${query ? `?${query}` : ""}`);
			},
		},

		issues: {
			async list(owner, repo, opts = {}) {
				const params = new URLSearchParams();
				if (opts.per_page) params.set("per_page", String(opts.per_page));
				if (opts.page) params.set("page", String(opts.page));
				if (opts.state) params.set("state", opts.state);
				if (opts.sort) params.set("sort", opts.sort);
				if (opts.direction) params.set("direction", opts.direction);
				const query = params.toString();
				return request<GitHubIssue[]>(
					"GET",
					`/repos/${owner}/${repo}/issues${query ? `?${query}` : ""}`,
				);
			},

			async get(owner, repo, number) {
				return request<GitHubIssue>("GET", `/repos/${owner}/${repo}/issues/${number}`);
			},

			async create(owner, repo, options) {
				return request<GitHubIssue>("POST", `/repos/${owner}/${repo}/issues`, options);
			},

			async update(owner, repo, number, options) {
				return request<GitHubIssue>("PATCH", `/repos/${owner}/${repo}/issues/${number}`, options);
			},

			async createComment(owner, repo, number, body) {
				return request<{ id: number; body: string }>(
					"POST",
					`/repos/${owner}/${repo}/issues/${number}/comments`,
					{ body },
				);
			},
		},

		pulls: {
			async list(owner, repo, opts = {}) {
				const params = new URLSearchParams();
				if (opts.per_page) params.set("per_page", String(opts.per_page));
				if (opts.page) params.set("page", String(opts.page));
				if (opts.state) params.set("state", opts.state);
				if (opts.sort) params.set("sort", opts.sort);
				if (opts.direction) params.set("direction", opts.direction);
				const query = params.toString();
				return request<GitHubPullRequest[]>(
					"GET",
					`/repos/${owner}/${repo}/pulls${query ? `?${query}` : ""}`,
				);
			},

			async get(owner, repo, number) {
				return request<GitHubPullRequest>("GET", `/repos/${owner}/${repo}/pulls/${number}`);
			},

			async create(owner, repo, options) {
				return request<GitHubPullRequest>("POST", `/repos/${owner}/${repo}/pulls`, options);
			},

			async merge(owner, repo, number, options = {}) {
				return request<{ merged: boolean; sha: string }>(
					"PUT",
					`/repos/${owner}/${repo}/pulls/${number}/merge`,
					options,
				);
			},

			async createReview(owner, repo, number, options) {
				return request<{ id: number }>(
					"POST",
					`/repos/${owner}/${repo}/pulls/${number}/reviews`,
					options,
				);
			},
		},

		orgs: {
			async get(org) {
				return request<{ id: number; login: string; name: string; description: string }>(
					"GET",
					`/orgs/${org}`,
				);
			},

			async listMembers(org, opts = {}) {
				const params = new URLSearchParams();
				if (opts.per_page) params.set("per_page", String(opts.per_page));
				if (opts.page) params.set("page", String(opts.page));
				const query = params.toString();
				return request<Array<{ id: number; login: string; avatar_url: string }>>(
					"GET",
					`/orgs/${org}/members${query ? `?${query}` : ""}`,
				);
			},
		},
	};
}
