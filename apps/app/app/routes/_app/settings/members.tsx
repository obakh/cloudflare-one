import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Mail, MoreHorizontal, Shield } from "lucide-react";
import { useState } from "react";
import { type Column, DataTable } from "~/components/data-table";
import { NoMembersState } from "~/components/empty-state";
import { InviteModal } from "~/components/invite-modal";
import type { Route } from "./+types/members";

type Member = {
	id: string;
	name: string;
	email: string;
	role: string;
	status: string;
	joinedAt: string;
};

type Invite = {
	id: string;
	email: string;
	role: string;
	invitedAt: string;
};

export async function loader({ context }: Route.LoaderArgs) {
	return {
		members: [
			{
				id: "1",
				name: "John Doe",
				email: "john@example.com",
				role: "owner",
				status: "active",
				joinedAt: "2024-01-15",
			},
			{
				id: "2",
				name: "Jane Smith",
				email: "jane@example.com",
				role: "admin",
				status: "active",
				joinedAt: "2024-02-20",
			},
			{
				id: "3",
				name: "Bob Wilson",
				email: "bob@example.com",
				role: "member",
				status: "active",
				joinedAt: "2024-03-10",
			},
		],
		pendingInvites: [
			{ id: "4", email: "alice@example.com", role: "member", invitedAt: "2024-06-01" },
		],
	};
}

const memberColumns: Column<Member>[] = [
	{
		key: "name",
		header: "Member",
		sortable: true,
		render: (member) => (
			<div className="flex items-center gap-3">
				<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
					{member.name.slice(0, 2).toUpperCase()}
				</div>
				<div>
					<p className="font-medium">{member.name}</p>
					<p className="text-xs text-muted-foreground">{member.email}</p>
				</div>
			</div>
		),
	},
	{
		key: "role",
		header: "Role",
		sortable: true,
		width: "100px",
		render: (member) => (
			<span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize">
				{member.role}
			</span>
		),
	},
	{
		key: "joinedAt",
		header: "Joined",
		sortable: true,
		width: "120px",
		render: (member) => new Date(member.joinedAt).toLocaleDateString(),
	},
	{
		key: "actions",
		header: "",
		width: "50px",
		render: (member) =>
			member.role !== "owner" ? (
				<Button type="button" variant="ghost" size="icon" className="h-8 w-8">
					<MoreHorizontal className="h-4 w-4 text-muted-foreground" />
				</Button>
			) : null,
	},
];

export default function MembersSettings({ loaderData }: Route.ComponentProps) {
	const { members, pendingInvites } = loaderData;
	const [showInviteModal, setShowInviteModal] = useState(false);

	const handleInvite = async (invites: { email: string; role: string }[]) => {
		// TODO: Send invites via API
		console.log("Inviting:", invites);
	};

	return (
		<div className="space-y-6">
			{/* Team Members Card */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0">
					<div>
						<CardTitle>Team members</CardTitle>
						<CardDescription>Manage who has access to your workspace.</CardDescription>
					</div>
					<Button type="button" onClick={() => setShowInviteModal(true)}>
						Invite Member
					</Button>
				</CardHeader>
				<CardContent>
					<DataTable
						data={members}
						columns={memberColumns}
						keyExtractor={(m) => m.id}
						searchable
						searchPlaceholder="Search members..."
						searchKeys={["name", "email"]}
						pageSize={10}
						emptyState={<NoMembersState onInvite={() => setShowInviteModal(true)} />}
					/>
				</CardContent>
			</Card>

			{/* Pending Invites Card */}
			{pendingInvites.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Pending invites</CardTitle>
						<CardDescription>Invitations that haven't been accepted yet.</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<div className="divide-y">
							{pendingInvites.map((invite: Invite) => (
								<div key={invite.id} className="flex items-center justify-between p-4">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed">
											<Mail className="h-4 w-4 text-muted-foreground" />
										</div>
										<div>
											<p className="font-medium">{invite.email}</p>
											<p className="text-sm text-muted-foreground">Invited as {invite.role}</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Button type="button" variant="outline" size="sm">
											Resend
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
										>
											Revoke
										</Button>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Roles Info Card */}
			<Card className="bg-muted/50">
				<CardHeader>
					<CardTitle>Role permissions</CardTitle>
					<CardDescription>Understanding what each role can do.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-start gap-2">
						<Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
						<div>
							<span className="text-sm font-medium">Owner</span>
							<span className="text-sm text-muted-foreground">
								{" "}
								- Full access, can delete workspace
							</span>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
						<div>
							<span className="text-sm font-medium">Admin</span>
							<span className="text-sm text-muted-foreground">
								{" "}
								- Can manage members and settings
							</span>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
						<div>
							<span className="text-sm font-medium">Member</span>
							<span className="text-sm text-muted-foreground"> - Can view and edit content</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Invite Modal */}
			<InviteModal
				isOpen={showInviteModal}
				onClose={() => setShowInviteModal(false)}
				onInvite={handleInvite}
			/>
		</div>
	);
}

export const handle = {
	breadcrumb: "Members",
};
