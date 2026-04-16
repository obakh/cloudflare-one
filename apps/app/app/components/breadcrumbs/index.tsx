import { ChevronRight, Home } from "lucide-react";
import { Link, useMatches } from "react-router";

interface BreadcrumbHandle {
	breadcrumb?: string | ((data: unknown) => string);
}

/**
 * Breadcrumbs component that automatically generates breadcrumbs
 * from route handles.
 *
 * Usage: Add a `handle` export to your route with a `breadcrumb` property:
 *
 * ```tsx
 * export const handle = {
 *   breadcrumb: "Dashboard",
 * };
 *
 * // Or dynamic:
 * export const handle = {
 *   breadcrumb: (data) => data.team.name,
 * };
 * ```
 */
export function Breadcrumbs() {
	const matches = useMatches();

	const breadcrumbs = matches
		.filter((match) => {
			const handle = match.handle as BreadcrumbHandle | undefined;
			return handle?.breadcrumb;
		})
		.map((match) => {
			const handle = match.handle as BreadcrumbHandle;
			const breadcrumb =
				typeof handle.breadcrumb === "function" ? handle.breadcrumb(match.data) : handle.breadcrumb;

			return {
				label: breadcrumb,
				pathname: match.pathname,
			};
		});

	if (breadcrumbs.length === 0) {
		return null;
	}

	return (
		<nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
			<Link
				to="/"
				className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
			>
				<Home className="h-4 w-4" />
			</Link>

			{breadcrumbs.map((crumb, index) => {
				const isLast = index === breadcrumbs.length - 1;

				return (
					<div key={crumb.pathname} className="flex items-center gap-1">
						<ChevronRight className="h-4 w-4 text-muted-foreground" />
						{isLast ? (
							<span className="font-medium">{crumb.label}</span>
						) : (
							<Link
								to={crumb.pathname}
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								{crumb.label}
							</Link>
						)}
					</div>
				);
			})}
		</nav>
	);
}

/**
 * Simple breadcrumbs for manual use
 */
export function SimpleBreadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
	return (
		<nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
			<Link
				to="/"
				className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
			>
				<Home className="h-4 w-4" />
			</Link>

			{items.map((item, index) => {
				const isLast = index === items.length - 1;

				return (
					<div key={item.label} className="flex items-center gap-1">
						<ChevronRight className="h-4 w-4 text-muted-foreground" />
						{isLast || !item.href ? (
							<span className={isLast ? "font-medium" : "text-muted-foreground"}>{item.label}</span>
						) : (
							<Link
								to={item.href}
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								{item.label}
							</Link>
						)}
					</div>
				);
			})}
		</nav>
	);
}
