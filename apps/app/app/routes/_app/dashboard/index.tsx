import { Activity, CreditCard, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { type Column, DataTable } from "~/components/data-table";
import { NoDataState } from "~/components/empty-state";
import { DashboardSkeleton } from "~/components/skeleton";
import { ProgressStat, StatsGrid } from "~/components/stats";
import type { Route } from "./+types/index";

export async function loader() {
	// TODO: Fetch dashboard data from API
	return {
		statsData: {
			revenue: { value: "$45,231.89", change: 20.1 },
			users: { value: "2,350", change: 180.1 },
			sessions: { value: "12,234", change: 19 },
			growth: { value: "+573", change: 201 },
		},
		usage: { value: 7500, max: 10000, unit: " requests" },
		recentActivity: [
			{
				id: "1",
				user: "John Doe",
				email: "john@example.com",
				action: "created a new project",
				time: "2 hours ago",
			},
			{
				id: "2",
				user: "Jane Smith",
				email: "jane@example.com",
				action: "updated billing settings",
				time: "4 hours ago",
			},
			{
				id: "3",
				user: "Bob Wilson",
				email: "bob@example.com",
				action: "invited a team member",
				time: "6 hours ago",
			},
			{
				id: "4",
				user: "Alice Brown",
				email: "alice@example.com",
				action: "deployed to production",
				time: "8 hours ago",
			},
			{
				id: "5",
				user: "Charlie Davis",
				email: "charlie@example.com",
				action: "created API key",
				time: "1 day ago",
			},
		],
	};
}

type ActivityItem = {
	id: string;
	user: string;
	email: string;
	action: string;
	time: string;
};

const activityColumns: Column<ActivityItem>[] = [
	{
		key: "user",
		header: "User",
		sortable: true,
		render: (item) => (
			<div className="flex items-center gap-3">
				<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
					{item.user.slice(0, 2).toUpperCase()}
				</div>
				<div>
					<p className="font-medium">{item.user}</p>
					<p className="text-xs text-muted-foreground">{item.email}</p>
				</div>
			</div>
		),
	},
	{ key: "action", header: "Action", sortable: true },
	{ key: "time", header: "Time", sortable: true, width: "120px" },
];

export default function Dashboard({ loaderData }: Route.ComponentProps) {
	const { statsData, usage, recentActivity } = loaderData;
	const [isLoading] = useState(false);

	// Build stats with icons on the client side
	const stats = [
		{
			title: "Total Revenue",
			value: statsData.revenue.value,
			change: statsData.revenue.change,
			changeLabel: "from last month",
			icon: CreditCard,
		},
		{
			title: "Active Users",
			value: statsData.users.value,
			change: statsData.users.change,
			changeLabel: "from last month",
			icon: Users,
		},
		{
			title: "Active Sessions",
			value: statsData.sessions.value,
			change: statsData.sessions.change,
			changeLabel: "from last month",
			icon: Activity,
		},
		{
			title: "Growth Rate",
			value: statsData.growth.value,
			change: statsData.growth.change,
			changeLabel: "from last month",
			icon: TrendingUp,
		},
	];

	if (isLoading) {
		return <DashboardSkeleton />;
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">Dashboard</h1>
				<p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
			</div>

			{/* Stats Grid */}
			<StatsGrid stats={stats} columns={4} />

			{/* Usage Progress */}
			<ProgressStat title="API Usage" value={usage.value} max={usage.max} unit={usage.unit} />

			{/* Recent Activity Table */}
			<div className="border">
				<div className="border-b p-4">
					<h2 className="font-semibold">Recent Activity</h2>
				</div>
				<div className="p-4">
					<DataTable
						data={recentActivity}
						columns={activityColumns}
						keyExtractor={(item) => item.id}
						searchable
						searchPlaceholder="Search activity..."
						searchKeys={["user", "action"]}
						pageSize={5}
						emptyState={
							<NoDataState
								title="No activity yet"
								description="Activity will appear here once users start interacting."
							/>
						}
					/>
				</div>
			</div>
		</div>
	);
}

export const handle = {
	breadcrumb: "Dashboard",
};
