import { ArrowDown, ArrowUp, BarChart3, TrendingUp, Users } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/index";

export async function loader() {
	// TODO: Fetch analytics data
	return {
		overview: {
			totalUsers: 2350,
			userChange: 12.5,
			activeUsers: 1890,
			activeChange: 8.2,
			revenue: 45231.89,
			revenueChange: 20.1,
			conversionRate: 3.2,
			conversionChange: -0.5,
		},
		chartData: {
			labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
			users: [1200, 1400, 1600, 1800, 2100, 2350],
			revenue: [25000, 28000, 32000, 35000, 40000, 45231],
		},
		topPages: [
			{ path: "/dashboard", views: 12500, unique: 8900 },
			{ path: "/settings", views: 8200, unique: 6100 },
			{ path: "/activity", views: 5600, unique: 4200 },
			{ path: "/vault", views: 3400, unique: 2800 },
		],
		recentEvents: [
			{ event: "user.signup", count: 45, change: 12 },
			{ event: "subscription.created", count: 12, change: 3 },
			{ event: "file.uploaded", count: 234, change: -15 },
			{ event: "team.invited", count: 28, change: 8 },
		],
	};
}

export default function Insights({ loaderData }: Route.ComponentProps) {
	const { overview, chartData, topPages, recentEvents } = loaderData;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">Insights</h1>
				<p className="text-muted-foreground">Analytics and metrics for your workspace.</p>
			</div>

			{/* Overview Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Total Users"
					value={overview.totalUsers.toLocaleString()}
					change={overview.userChange}
					icon={Users}
				/>
				<MetricCard
					title="Active Users"
					value={overview.activeUsers.toLocaleString()}
					change={overview.activeChange}
					icon={Users}
				/>
				<MetricCard
					title="Revenue"
					value={`$${overview.revenue.toLocaleString()}`}
					change={overview.revenueChange}
					icon={TrendingUp}
				/>
				<MetricCard
					title="Conversion Rate"
					value={`${overview.conversionRate}%`}
					change={overview.conversionChange}
					icon={BarChart3}
				/>
			</div>

			{/* Charts */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* User Growth Chart */}
				<div className="rounded-lg border bg-card p-6">
					<h3 className="font-medium">User Growth</h3>
					<p className="text-sm text-muted-foreground">Monthly active users over time</p>
					<div className="mt-4 h-48">
						<SimpleBarChart data={chartData.users} labels={chartData.labels} />
					</div>
				</div>

				{/* Revenue Chart */}
				<div className="rounded-lg border bg-card p-6">
					<h3 className="font-medium">Revenue</h3>
					<p className="text-sm text-muted-foreground">Monthly revenue over time</p>
					<div className="mt-4 h-48">
						<SimpleBarChart
							data={chartData.revenue}
							labels={chartData.labels}
							color="bg-green-500"
						/>
					</div>
				</div>
			</div>

			{/* Tables */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Top Pages */}
				<div className="rounded-lg border bg-card">
					<div className="border-b px-4 py-3">
						<h3 className="font-medium">Top Pages</h3>
					</div>
					<div className="divide-y">
						{topPages.map((page) => (
							<div key={page.path} className="flex items-center justify-between px-4 py-3">
								<span className="font-mono text-sm">{page.path}</span>
								<div className="flex gap-6 text-sm">
									<span className="text-muted-foreground">{page.views.toLocaleString()} views</span>
									<span>{page.unique.toLocaleString()} unique</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Recent Events */}
				<div className="rounded-lg border bg-card">
					<div className="border-b px-4 py-3">
						<h3 className="font-medium">Recent Events</h3>
					</div>
					<div className="divide-y">
						{recentEvents.map((event) => (
							<div key={event.event} className="flex items-center justify-between px-4 py-3">
								<span className="font-mono text-sm">{event.event}</span>
								<div className="flex items-center gap-2">
									<span className="font-medium">{event.count}</span>
									<span
										className={cn(
											"flex items-center text-xs",
											event.change >= 0 ? "text-green-600" : "text-red-600",
										)}
									>
										{event.change >= 0 ? (
											<ArrowUp className="h-3 w-3" />
										) : (
											<ArrowDown className="h-3 w-3" />
										)}
										{Math.abs(event.change)}%
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function MetricCard({
	title,
	value,
	change,
	icon: Icon,
}: {
	title: string;
	value: string;
	change: number;
	icon: React.ComponentType<{ className?: string }>;
}) {
	const isPositive = change >= 0;

	return (
		<div className="rounded-lg border bg-card p-6">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-muted-foreground">{title}</span>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</div>
			<div className="mt-2">
				<span className="text-2xl font-bold">{value}</span>
				<span
					className={cn(
						"ml-2 inline-flex items-center text-sm",
						isPositive ? "text-green-600" : "text-red-600",
					)}
				>
					{isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
					{Math.abs(change)}%
				</span>
			</div>
		</div>
	);
}

function SimpleBarChart({
	data,
	labels,
	color = "bg-primary",
}: {
	data: number[];
	labels: string[];
	color?: string;
}) {
	const max = Math.max(...data);

	return (
		<div className="flex h-full items-end gap-2">
			{data.map((value, index) => (
				<div key={labels[index]} className="flex flex-1 flex-col items-center gap-1">
					<div
						className={cn("w-full rounded-t", color)}
						style={{ height: `${(value / max) * 100}%` }}
					/>
					<span className="text-xs text-muted-foreground">{labels[index]}</span>
				</div>
			))}
		</div>
	);
}

export const handle = {
	breadcrumb: "Insights",
};
