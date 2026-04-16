import { cn } from "~/lib/utils";

interface SkeletonProps {
	className?: string;
	style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
	return <div className={cn("animate-pulse bg-muted", className)} style={style} />;
}

// Common skeleton patterns
export function TextSkeleton({ lines = 1, className }: { lines?: number; className?: string }) {
	return (
		<div className={cn("space-y-2", className)}>
			{Array.from({ length: lines }).map((_, i) => (
				<Skeleton
					key={i}
					className={cn("h-4", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full")}
				/>
			))}
		</div>
	);
}

export function AvatarSkeleton({ size = 40 }: { size?: number }) {
	return <Skeleton style={{ width: size, height: size }} />;
}

export function CardSkeleton({ className }: SkeletonProps) {
	return (
		<div className={cn("border p-4", className)}>
			<div className="flex items-center gap-3">
				<AvatarSkeleton />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-4 w-1/3" />
					<Skeleton className="h-3 w-1/2" />
				</div>
			</div>
			<div className="mt-4 space-y-2">
				<Skeleton className="h-3 w-full" />
				<Skeleton className="h-3 w-4/5" />
			</div>
		</div>
	);
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
	return (
		<tr className="border-b">
			{Array.from({ length: columns }).map((_, i) => (
				<td key={i} className="p-4">
					<Skeleton className="h-4 w-full" />
				</td>
			))}
		</tr>
	);
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
	return (
		<div className="border">
			<table className="w-full">
				<thead>
					<tr className="border-b bg-muted/50">
						{Array.from({ length: columns }).map((_, i) => (
							<th key={i} className="p-4 text-left">
								<Skeleton className="h-4 w-20" />
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: rows }).map((_, i) => (
						<TableRowSkeleton key={i} columns={columns} />
					))}
				</tbody>
			</table>
		</div>
	);
}

export function ListSkeleton({ items = 3 }: { items?: number }) {
	return (
		<div className="space-y-3">
			{Array.from({ length: items }).map((_, i) => (
				<div key={i} className="flex items-center gap-3 border p-3">
					<AvatarSkeleton size={32} />
					<div className="flex-1 space-y-1">
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="h-3 w-1/2" />
					</div>
				</div>
			))}
		</div>
	);
}

export function ChartSkeleton({ className }: SkeletonProps) {
	return (
		<div className={cn("border p-4", className)}>
			<div className="mb-4 flex items-center justify-between">
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-8 w-24" />
			</div>
			<div className="flex h-48 items-end gap-2">
				{Array.from({ length: 12 }).map((_, i) => (
					<Skeleton key={i} className="flex-1" style={{ height: `${Math.random() * 80 + 20}%` }} />
				))}
			</div>
		</div>
	);
}

export function StatCardSkeleton() {
	return (
		<div className="border p-4">
			<Skeleton className="h-4 w-20" />
			<Skeleton className="mt-2 h-8 w-32" />
			<Skeleton className="mt-2 h-3 w-24" />
		</div>
	);
}

export function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			{/* Stats row */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<StatCardSkeleton key={i} />
				))}
			</div>

			{/* Charts row */}
			<div className="grid gap-4 lg:grid-cols-2">
				<ChartSkeleton />
				<ChartSkeleton />
			</div>

			{/* Table */}
			<TableSkeleton rows={5} columns={5} />
		</div>
	);
}
