import { Building2, Check, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { cn } from "~/lib/utils";

interface Organization {
	id: string;
	name: string;
	slug: string;
	logo?: string;
}

interface OrganizationSwitcherProps {
	organizations: Organization[];
	currentOrg: Organization;
	onSwitch: (org: Organization) => void;
	isCollapsed?: boolean;
}

export function OrganizationSwitcher({
	organizations,
	currentOrg,
	onSwitch,
	isCollapsed = false,
}: OrganizationSwitcherProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					"flex w-full items-center gap-2 p-2 hover:bg-sidebar-accent transition-colors",
					isCollapsed && "justify-center",
				)}
			>
				<div className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary text-primary-foreground">
					{currentOrg.logo ? (
						<img
							src={currentOrg.logo}
							alt={currentOrg.name}
							className="h-full w-full object-cover"
						/>
					) : (
						<Building2 className="h-4 w-4" />
					)}
				</div>
				{!isCollapsed && (
					<>
						<div className="flex flex-1 flex-col overflow-hidden text-left">
							<span className="truncate text-sm font-medium text-sidebar-foreground">
								{currentOrg.name}
							</span>
							<span className="truncate text-xs text-sidebar-muted">@{currentOrg.slug}</span>
						</div>
						<ChevronDown
							className={cn(
								"h-4 w-4 text-sidebar-muted transition-transform",
								isOpen && "rotate-180",
							)}
						/>
					</>
				)}
			</button>

			{isOpen && (
				<>
					<button
						type="button"
						className="fixed inset-0 z-40 cursor-default"
						onClick={() => setIsOpen(false)}
						onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
						aria-label="Close menu"
					/>
					<div className="absolute left-0 top-full z-50 mt-1 w-64 border bg-popover p-1 shadow-lg">
						<div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
							Organizations
						</div>
						{organizations.map((org) => (
							<button
								key={org.id}
								type="button"
								onClick={() => {
									onSwitch(org);
									setIsOpen(false);
								}}
								className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent"
							>
								<div className="flex h-6 w-6 items-center justify-center bg-muted">
									{org.logo ? (
										<img src={org.logo} alt={org.name} className="h-full w-full object-cover" />
									) : (
										<Building2 className="h-3 w-3" />
									)}
								</div>
								<span className="flex-1 truncate text-left">{org.name}</span>
								{org.id === currentOrg.id && <Check className="h-4 w-4 text-primary" />}
							</button>
						))}
						<div className="my-1 border-t" />
						<Link
							to="/setup"
							onClick={() => setIsOpen(false)}
							className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent"
						>
							<Plus className="h-4 w-4" />
							Create organization
						</Link>
					</div>
				</>
			)}
		</div>
	);
}
