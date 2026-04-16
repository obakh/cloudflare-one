import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "~/lib/utils";

interface StatCardProps {
	title: string;
	value: string | number;
	change?: number;
	changeLabel?: string;
	icon?: LucideIcon;
	className?: string;
}

export function StatCard({
	title,
	value,
	change,
	changeLabel,
	icon: Icon,
	className,
}: StatCardProps) {
	const isPositive = change && change > 0;
	const isNegative = change && change < 0;

	return (
		<div className={cn("border p-4", className)}>
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">{title}</p>
				{Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
			</div>
			<p className="mt-2 text-2xl font-semibold">{value}</p>
			{change !== undefined && (
				<div className="mt-2 flex items-center gap-1 text-sm">
					{isPositive && <ArrowUp className="h-3 w-3 text-green-500" />}
					{isNegative && <ArrowDown className="h-3 w-3 text-red-500" />}
					{!isPositive && !isNegative && <Minus className="h-3 w-3 text-muted-foreground" />}
					<span
						className={cn(
							isPositive && "text-green-500",
							isNegative && "text-red-500",
							!isPositive && !isNegative && "text-muted-foreground",
						)}
					>
						{Math.abs(change)}%
					</span>
					{changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
				</div>
			)}
		</div>
	);
}

// Stats grid
interface StatsGridProps {
	stats: StatCardProps[];
	columns?: 2 | 3 | 4;
	className?: string;
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
	const gridCols = {
		2: "sm:grid-cols-2",
		3: "sm:grid-cols-2 lg:grid-cols-3",
		4: "sm:grid-cols-2 lg:grid-cols-4",
	};

	return (
		<div className={cn("grid gap-4", gridCols[columns], className)}>
			{stats.map((stat, i) => (
				<StatCard key={i} {...stat} />
			))}
		</div>
	);
}

// Animated number display
interface AnimatedNumberProps {
	value: number;
	prefix?: string;
	suffix?: string;
	decimals?: number;
	className?: string;
}

export function AnimatedNumber({
	value,
	prefix = "",
	suffix = "",
	decimals = 0,
	className,
}: AnimatedNumberProps) {
	const formatted = value.toLocaleString(undefined, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});

	return (
		<span className={cn("tabular-nums", className)}>
			{prefix}
			{formatted}
			{suffix}
		</span>
	);
}

// Progress stat
interface ProgressStatProps {
	title: string;
	value: number;
	max: number;
	unit?: string;
	className?: string;
}

export function ProgressStat({ title, value, max, unit = "", className }: ProgressStatProps) {
	const percentage = Math.min((value / max) * 100, 100);

	return (
		<div className={cn("border p-4", className)}>
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">{title}</p>
				<p className="text-sm font-medium">
					{value.toLocaleString()}
					{unit} / {max.toLocaleString()}
					{unit}
				</p>
			</div>
			<div className="mt-3 h-2 overflow-hidden bg-muted">
				<div className="h-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
			</div>
		</div>
	);
}
