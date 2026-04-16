/**
 * Linear API Client for Cloudflare Workers
 *
 * Linear uses GraphQL API. This client provides typed helpers for common operations.
 *
 * @example
 * ```ts
 * import { createLinearClient } from "@repo/integrations/linear/api";
 *
 * const linear = createLinearClient(accessToken);
 *
 * // Get issues
 * const issues = await linear.issues.list({ first: 50 });
 *
 * // Create issue
 * const issue = await linear.issues.create({
 *   teamId: "team-id",
 *   title: "Bug report",
 *   description: "Description...",
 * });
 *
 * // Update issue
 * await linear.issues.update(issueId, { stateId: "done-state-id" });
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface LinearIssue {
	id: string;
	identifier: string;
	title: string;
	description?: string;
	priority: number;
	priorityLabel: string;
	estimate?: number;
	dueDate?: string;
	url: string;
	createdAt: string;
	updatedAt: string;
	state: { id: string; name: string; type: string };
	team: { id: string; key: string; name: string };
	assignee?: { id: string; name: string; email: string };
	creator?: { id: string; name: string };
	labels: { nodes: Array<{ id: string; name: string; color: string }> };
	project?: { id: string; name: string };
	cycle?: { id: string; name: string; number: number };
}

export interface LinearTeam {
	id: string;
	key: string;
	name: string;
	description?: string;
	icon?: string;
	color?: string;
	private: boolean;
	issueCount: number;
	states: { nodes: Array<{ id: string; name: string; type: string; color: string }> };
	labels: { nodes: Array<{ id: string; name: string; color: string }> };
}

export interface LinearProject {
	id: string;
	name: string;
	description?: string;
	state: string;
	progress: number;
	url: string;
	targetDate?: string;
	startDate?: string;
	lead?: { id: string; name: string };
}

export interface LinearUser {
	id: string;
	name: string;
	displayName: string;
	email: string;
	avatarUrl?: string;
	admin: boolean;
	active: boolean;
}

export interface LinearComment {
	id: string;
	body: string;
	url: string;
	createdAt: string;
	user: { id: string; name: string };
}

export interface CreateIssueInput {
	teamId: string;
	title: string;
	description?: string;
	priority?: number;
	estimate?: number;
	assigneeId?: string;
	stateId?: string;
	labelIds?: string[];
	projectId?: string;
	cycleId?: string;
	dueDate?: string;
	parentId?: string;
}

export interface UpdateIssueInput {
	title?: string;
	description?: string;
	priority?: number;
	estimate?: number;
	assigneeId?: string;
	stateId?: string;
	labelIds?: string[];
	projectId?: string;
	cycleId?: string;
	dueDate?: string;
}

export interface ListOptions {
	first?: number;
	after?: string;
	filter?: Record<string, unknown>;
}

// ============================================================================
// GraphQL Helpers
// ============================================================================

async function graphql<T>(
	accessToken: string,
	query: string,
	variables?: Record<string, unknown>,
): Promise<T> {
	const response = await fetch("https://api.linear.app/graphql", {
		method: "POST",
		headers: {
			Authorization: accessToken,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ query, variables }),
	});

	if (!response.ok) {
		throw new Error(`Linear API error: ${response.status}`);
	}

	const result = (await response.json()) as { data: T; errors?: Array<{ message: string }> };

	if (result.errors?.length) {
		throw new Error(`Linear GraphQL error: ${result.errors[0].message}`);
	}

	return result.data;
}

// ============================================================================
// API Client
// ============================================================================

export interface LinearClient {
	graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T>;
	viewer: {
		get(): Promise<LinearUser>;
	};
	teams: {
		list(
			options?: ListOptions,
		): Promise<{ nodes: LinearTeam[]; pageInfo: { hasNextPage: boolean; endCursor?: string } }>;
		get(id: string): Promise<LinearTeam>;
	};
	issues: {
		list(
			options?: ListOptions,
		): Promise<{ nodes: LinearIssue[]; pageInfo: { hasNextPage: boolean; endCursor?: string } }>;
		get(id: string): Promise<LinearIssue>;
		create(input: CreateIssueInput): Promise<LinearIssue>;
		update(id: string, input: UpdateIssueInput): Promise<LinearIssue>;
		delete(id: string): Promise<boolean>;
		addComment(issueId: string, body: string): Promise<LinearComment>;
	};
	projects: {
		list(
			options?: ListOptions,
		): Promise<{ nodes: LinearProject[]; pageInfo: { hasNextPage: boolean; endCursor?: string } }>;
		get(id: string): Promise<LinearProject>;
	};
	users: {
		list(
			options?: ListOptions,
		): Promise<{ nodes: LinearUser[]; pageInfo: { hasNextPage: boolean; endCursor?: string } }>;
		get(id: string): Promise<LinearUser>;
	};
}

export function createLinearClient(accessToken: string): LinearClient {
	const gql = <T>(query: string, variables?: Record<string, unknown>) =>
		graphql<T>(accessToken, query, variables);

	return {
		graphql: gql,

		viewer: {
			async get() {
				const data = await gql<{ viewer: LinearUser }>(`
					query {
						viewer {
							id
							name
							displayName
							email
							avatarUrl
							admin
							active
						}
					}
				`);
				return data.viewer;
			},
		},

		teams: {
			async list(options = {}) {
				const data = await gql<{
					teams: { nodes: LinearTeam[]; pageInfo: { hasNextPage: boolean; endCursor?: string } };
				}>(
					`
					query($first: Int, $after: String) {
						teams(first: $first, after: $after) {
							nodes {
								id
								key
								name
								description
								icon
								color
								private
								issueCount
								states { nodes { id name type color } }
								labels { nodes { id name color } }
							}
							pageInfo { hasNextPage endCursor }
						}
					}
				`,
					{ first: options.first || 50, after: options.after },
				);
				return data.teams;
			},

			async get(id) {
				const data = await gql<{ team: LinearTeam }>(
					`
					query($id: String!) {
						team(id: $id) {
							id
							key
							name
							description
							icon
							color
							private
							issueCount
							states { nodes { id name type color } }
							labels { nodes { id name color } }
						}
					}
				`,
					{ id },
				);
				return data.team;
			},
		},

		issues: {
			async list(options = {}) {
				const data = await gql<{
					issues: { nodes: LinearIssue[]; pageInfo: { hasNextPage: boolean; endCursor?: string } };
				}>(
					`
					query($first: Int, $after: String, $filter: IssueFilter) {
						issues(first: $first, after: $after, filter: $filter) {
							nodes {
								id
								identifier
								title
								description
								priority
								priorityLabel
								estimate
								dueDate
								url
								createdAt
								updatedAt
								state { id name type }
								team { id key name }
								assignee { id name email }
								creator { id name }
								labels { nodes { id name color } }
								project { id name }
								cycle { id name number }
							}
							pageInfo { hasNextPage endCursor }
						}
					}
				`,
					{ first: options.first || 50, after: options.after, filter: options.filter },
				);
				return data.issues;
			},

			async get(id) {
				const data = await gql<{ issue: LinearIssue }>(
					`
					query($id: String!) {
						issue(id: $id) {
							id
							identifier
							title
							description
							priority
							priorityLabel
							estimate
							dueDate
							url
							createdAt
							updatedAt
							state { id name type }
							team { id key name }
							assignee { id name email }
							creator { id name }
							labels { nodes { id name color } }
							project { id name }
							cycle { id name number }
						}
					}
				`,
					{ id },
				);
				return data.issue;
			},

			async create(input) {
				const data = await gql<{ issueCreate: { success: boolean; issue: LinearIssue } }>(
					`
					mutation($input: IssueCreateInput!) {
						issueCreate(input: $input) {
							success
							issue {
								id
								identifier
								title
								url
								createdAt
								state { id name type }
								team { id key name }
							}
						}
					}
				`,
					{ input },
				);
				return data.issueCreate.issue;
			},

			async update(id, input) {
				const data = await gql<{ issueUpdate: { success: boolean; issue: LinearIssue } }>(
					`
					mutation($id: String!, $input: IssueUpdateInput!) {
						issueUpdate(id: $id, input: $input) {
							success
							issue {
								id
								identifier
								title
								url
								updatedAt
								state { id name type }
							}
						}
					}
				`,
					{ id, input },
				);
				return data.issueUpdate.issue;
			},

			async delete(id) {
				const data = await gql<{ issueDelete: { success: boolean } }>(
					`
					mutation($id: String!) {
						issueDelete(id: $id) {
							success
						}
					}
				`,
					{ id },
				);
				return data.issueDelete.success;
			},

			async addComment(issueId, body) {
				const data = await gql<{ commentCreate: { success: boolean; comment: LinearComment } }>(
					`
					mutation($issueId: String!, $body: String!) {
						commentCreate(input: { issueId: $issueId, body: $body }) {
							success
							comment {
								id
								body
								url
								createdAt
								user { id name }
							}
						}
					}
				`,
					{ issueId, body },
				);
				return data.commentCreate.comment;
			},
		},

		projects: {
			async list(options = {}) {
				const data = await gql<{
					projects: {
						nodes: LinearProject[];
						pageInfo: { hasNextPage: boolean; endCursor?: string };
					};
				}>(
					`
					query($first: Int, $after: String) {
						projects(first: $first, after: $after) {
							nodes {
								id
								name
								description
								state
								progress
								url
								targetDate
								startDate
								lead { id name }
							}
							pageInfo { hasNextPage endCursor }
						}
					}
				`,
					{ first: options.first || 50, after: options.after },
				);
				return data.projects;
			},

			async get(id) {
				const data = await gql<{ project: LinearProject }>(
					`
					query($id: String!) {
						project(id: $id) {
							id
							name
							description
							state
							progress
							url
							targetDate
							startDate
							lead { id name }
						}
					}
				`,
					{ id },
				);
				return data.project;
			},
		},

		users: {
			async list(options = {}) {
				const data = await gql<{
					users: { nodes: LinearUser[]; pageInfo: { hasNextPage: boolean; endCursor?: string } };
				}>(
					`
					query($first: Int, $after: String) {
						users(first: $first, after: $after) {
							nodes {
								id
								name
								displayName
								email
								avatarUrl
								admin
								active
							}
							pageInfo { hasNextPage endCursor }
						}
					}
				`,
					{ first: options.first || 50, after: options.after },
				);
				return data.users;
			},

			async get(id) {
				const data = await gql<{ user: LinearUser }>(
					`
					query($id: String!) {
						user(id: $id) {
							id
							name
							displayName
							email
							avatarUrl
							admin
							active
						}
					}
				`,
					{ id },
				);
				return data.user;
			},
		},
	};
}

// ============================================================================
// Priority Constants
// ============================================================================

export const LINEAR_PRIORITIES = {
	NO_PRIORITY: 0,
	URGENT: 1,
	HIGH: 2,
	MEDIUM: 3,
	LOW: 4,
} as const;
