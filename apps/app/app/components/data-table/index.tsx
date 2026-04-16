import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	ChevronUp,
	Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "~/lib/utils";

export interface Column<T> {
	key: string;
	header: string;
	sortable?: boolean;
	width?: string;
	render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
	data: T[];
	columns: Column<T>[];
	keyExtractor: (item: T) => string;
	searchable?: boolean;
	searchPlaceholder?: string;
	searchKeys?: string[];
	pageSize?: number;
	onRowClick?: (item: T) => void;
	emptyState?: React.ReactNode;
	className?: string;
}

type SortDirection = "asc" | "desc" | null;

export function DataTable<T extends Record<string, unknown>>({
	data,
	columns,
	keyExtractor,
	searchable = false,
	searchPlaceholder = "Search...",
	searchKeys = [],
	pageSize = 10,
	onRowClick,
	emptyState,
	className,
}: DataTableProps<T>) {
	const [search, setSearch] = useState("");
	const [sortKey, setSortKey] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>(null);
	const [currentPage, setCurrentPage] = useState(1);

	// Filter data based on search
	const filteredData = useMemo(() => {
		if (!search.trim() || searchKeys.length === 0) return data;

		const searchLower = search.toLowerCase();
		return data.filter((item) =>
			searchKeys.some((key) => {
				const value = item[key];
				if (typeof value === "string") {
					return value.toLowerCase().includes(searchLower);
				}
				if (typeof value === "number") {
					return value.toString().includes(searchLower);
				}
				return false;
			}),
		);
	}, [data, search, searchKeys]);

	// Sort data
	const sortedData = useMemo(() => {
		if (!sortKey || !sortDirection) return filteredData;

		return [...filteredData].sort((a, b) => {
			const aVal = a[sortKey];
			const bVal = b[sortKey];

			if (aVal === bVal) return 0;
			if (aVal === null || aVal === undefined) return 1;
			if (bVal === null || bVal === undefined) return -1;

			const comparison = aVal < bVal ? -1 : 1;
			return sortDirection === "asc" ? comparison : -comparison;
		});
	}, [filteredData, sortKey, sortDirection]);

	// Paginate data
	const totalPages = Math.ceil(sortedData.length / pageSize);
	const paginatedData = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return sortedData.slice(start, start + pageSize);
	}, [sortedData, currentPage, pageSize]);

	const handleSort = (key: string) => {
		if (sortKey === key) {
			if (sortDirection === "asc") {
				setSortDirection("desc");
			} else if (sortDirection === "desc") {
				setSortKey(null);
				setSortDirection(null);
			}
		} else {
			setSortKey(key);
			setSortDirection("asc");
		}
	};

	// Reset to first page when search changes
	const handleSearch = (value: string) => {
		setSearch(value);
		setCurrentPage(1);
	};

	return (
		<div className={cn("space-y-4", className)}>
			{/* Search */}
			{searchable && (
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="text"
						value={search}
						onChange={(e) => handleSearch(e.target.value)}
						placeholder={searchPlaceholder}
						className="h-10 w-full max-w-sm border bg-transparent pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
			)}

			{/* Table */}
			<div className="border">
				<table className="w-full">
					<thead>
						<tr className="border-b bg-muted/50">
							{columns.map((column) => (
								<th
									key={column.key}
									className={cn(
										"p-4 text-left text-sm font-medium text-muted-foreground",
										column.sortable && "cursor-pointer select-none hover:text-foreground",
									)}
									style={{ width: column.width }}
									onClick={() => column.sortable && handleSort(column.key)}
								>
									<div className="flex items-center gap-1">
										{column.header}
										{column.sortable &&
											sortKey === column.key &&
											(sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											))}
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{paginatedData.length === 0 ? (
							<tr>
								<td colSpan={columns.length} className="p-8 text-center">
									{emptyState || <p className="text-sm text-muted-foreground">No data available</p>}
								</td>
							</tr>
						) : (
							paginatedData.map((item) => (
								<tr
									key={keyExtractor(item)}
									onClick={() => onRowClick?.(item)}
									className={cn(
										"border-b last:border-0",
										onRowClick && "cursor-pointer hover:bg-muted/50",
									)}
								>
									{columns.map((column) => (
										<td key={column.key} className="p-4 text-sm">
											{column.render ? column.render(item) : (item[column.key] as React.ReactNode)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Showing {(currentPage - 1) * pageSize + 1} to{" "}
						{Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
					</p>
					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={() => setCurrentPage(1)}
							disabled={currentPage === 1}
							className="flex h-8 w-8 items-center justify-center hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
						>
							<ChevronsLeft className="h-4 w-4" />
						</button>
						<button
							type="button"
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							className="flex h-8 w-8 items-center justify-center hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
						>
							<ChevronLeft className="h-4 w-4" />
						</button>
						<span className="px-2 text-sm">
							{currentPage} / {totalPages}
						</span>
						<button
							type="button"
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
							className="flex h-8 w-8 items-center justify-center hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
						>
							<ChevronRight className="h-4 w-4" />
						</button>
						<button
							type="button"
							onClick={() => setCurrentPage(totalPages)}
							disabled={currentPage === totalPages}
							className="flex h-8 w-8 items-center justify-center hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
						>
							<ChevronsRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
