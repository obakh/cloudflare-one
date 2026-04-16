import { formatRelativeTime } from "~/lib/utils";
import type { Route } from "./+types/index";

export async function loader({ context }: Route.LoaderArgs) {
	// TODO: Fetch activity data
	return {
		activities: [
			{
				id: 1,
				type: "user.created",
				actor: { name: "John Doe", email: "john@example.com" },
				description: "joined the team",
				timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
			},
			{
				id: 2,
				type: "settings.updated",
				actor: { name: "Jane Smith", email: "jane@example.com" },
				description: "updated team settings",
				timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
			},
			{
				id: 3,
				type: "member.invited",
				actor: { name: "Bob Wilson", email: "bob@example.com" },
				description: "invited alice@example.com to the team",
				timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
			},
			{
				id: 4,
				type: "billing.updated",
				actor: { name: "John Doe", email: "john@example.com" },
				description: "upgraded to Pro plan",
				timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
			},
		],
	};
}

export default function Activity({ loaderData }: Route.ComponentProps) {
	const { activities } = loaderData;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">Activity</h1>
				<p className="text-muted-foreground">Recent activity in your workspace.</p>
			</div>

			<div className="rounded-lg border bg-card">
				<div className="divide-y">
					{activities.map(
						(activity: {
							id: number;
							type: string;
							actor: { name: string; email: string };
							description: string;
							timestamp: string;
						}) => (
							<div key={activity.id} className="flex items-start gap-4 p-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
									{activity.actor.name.slice(0, 2).toUpperCase()}
								</div>
								<div className="flex-1">
									<p className="text-sm">
										<span className="font-medium">{activity.actor.name}</span>{" "}
										<span className="text-muted-foreground">{activity.description}</span>
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{formatRelativeTime(activity.timestamp)}
									</p>
								</div>
							</div>
						),
					)}
				</div>
			</div>
		</div>
	);
}

export const handle = {
	breadcrumb: "Activity",
};
