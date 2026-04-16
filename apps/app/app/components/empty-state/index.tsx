import { Button } from "@repo/ui";
import type { LucideIcon } from "lucide-react";
import { FileQuestion, Inbox, Search, Users } from "lucide-react";
import { cn } from "~/lib/utils";

interface EmptyStateProps {
	icon?: LucideIcon;
	title: string;
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	className?: string;
}

export function EmptyState({
	icon: Icon = FileQuestion,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center border border-dashed p-8 text-center",
				className,
			)}
		>
			<div className="flex h-12 w-12 items-center justify-center bg-muted">
				<Icon className="h-6 w-6 text-muted-foreground" />
			</div>
			<h3 className="mt-4 text-sm font-medium">{title}</h3>
			{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
			{action && (
				<Button onClick={action.onClick} className="mt-4">
					{action.label}
				</Button>
			)}
		</div>
	);
}

// Pre-configured empty states
export function NoResultsState({ onClear }: { onClear?: () => void }) {
	return (
		<EmptyState
			icon={Search}
			title="No results found"
			description="Try adjusting your search or filters."
			action={onClear ? { label: "Clear filters", onClick: onClear } : undefined}
		/>
	);
}

export function NoDataState({
	title = "No data yet",
	description,
	action,
}: {
	title?: string;
	description?: string;
	action?: { label: string; onClick: () => void };
}) {
	return <EmptyState icon={Inbox} title={title} description={description} action={action} />;
}

export function NoMembersState({ onInvite }: { onInvite?: () => void }) {
	return (
		<EmptyState
			icon={Users}
			title="No team members"
			description="Invite team members to collaborate."
			action={onInvite ? { label: "Invite members", onClick: onInvite } : undefined}
		/>
	);
}
