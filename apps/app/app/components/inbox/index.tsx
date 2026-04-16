import { Button } from "@repo/ui/button";
import { Bell, Check, Mail, Trash2, X } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface Notification {
	id: string;
	type: "info" | "success" | "warning" | "error";
	title: string;
	description: string;
	timestamp: string;
	read: boolean;
	actionUrl?: string;
}

interface InboxProps {
	notifications: Notification[];
	onMarkAsRead: (id: string) => void;
	onMarkAllAsRead: () => void;
	onDelete: (id: string) => void;
	onClose: () => void;
}

export function Inbox({
	notifications,
	onMarkAsRead,
	onMarkAllAsRead,
	onDelete,
	onClose,
}: InboxProps) {
	const [filter, setFilter] = useState<"all" | "unread">("all");

	const filteredNotifications =
		filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

	const unreadCount = notifications.filter((n) => !n.read).length;

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between border-b px-4 py-3">
				<div className="flex items-center gap-2">
					<Bell className="h-5 w-5" />
					<h2 className="font-semibold">Inbox</h2>
					{unreadCount > 0 && (
						<span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
							{unreadCount}
						</span>
					)}
				</div>
				<Button type="button" variant="ghost" size="icon" onClick={onClose}>
					<X className="h-5 w-5" />
				</Button>
			</div>

			{/* Filters */}
			<div className="flex items-center justify-between border-b px-4 py-2">
				<div className="flex gap-1">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setFilter("all")}
						className={cn(filter === "all" && "bg-accent font-medium")}
					>
						All
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setFilter("unread")}
						className={cn(filter === "unread" && "bg-accent font-medium")}
					>
						Unread
					</Button>
				</div>
				{unreadCount > 0 && (
					<button
						type="button"
						onClick={onMarkAllAsRead}
						className="text-sm text-primary hover:underline"
					>
						Mark all as read
					</button>
				)}
			</div>

			{/* Notifications List */}
			<div className="flex-1 overflow-y-auto">
				{filteredNotifications.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<Mail className="h-12 w-12 text-muted-foreground/50" />
						<p className="mt-4 text-sm font-medium">No notifications</p>
						<p className="mt-1 text-sm text-muted-foreground">
							{filter === "unread"
								? "You're all caught up!"
								: "You don't have any notifications yet."}
						</p>
					</div>
				) : (
					<div className="divide-y">
						{filteredNotifications.map((notification) => (
							<NotificationItem
								key={notification.id}
								notification={notification}
								onMarkAsRead={onMarkAsRead}
								onDelete={onDelete}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function NotificationItem({
	notification,
	onMarkAsRead,
	onDelete,
}: {
	notification: Notification;
	onMarkAsRead: (id: string) => void;
	onDelete: (id: string) => void;
}) {
	const typeStyles = {
		info: "bg-blue-500",
		success: "bg-green-500",
		warning: "bg-yellow-500",
		error: "bg-red-500",
	};

	return (
		<article
			className={cn(
				"group relative flex gap-3 px-4 py-3 hover:bg-accent/50",
				!notification.read && "bg-accent/30",
			)}
		>
			<div className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", typeStyles[notification.type])} />
			<div className="flex-1 min-w-0">
				<p className={cn("text-sm", !notification.read && "font-medium")}>{notification.title}</p>
				<p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
					{notification.description}
				</p>
				<p className="mt-1 text-xs text-muted-foreground">{notification.timestamp}</p>
			</div>

			<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
				{!notification.read && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => onMarkAsRead(notification.id)}
						title="Mark as read"
					>
						<Check className="h-4 w-4" />
					</Button>
				)}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-destructive"
					onClick={() => onDelete(notification.id)}
					title="Delete"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		</article>
	);
}

// Inbox trigger button for header
export function InboxTrigger({
	unreadCount,
	onClick,
}: {
	unreadCount: number;
	onClick: () => void;
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onClick={onClick}
			className="relative"
			title="Inbox"
		>
			<Bell className="h-5 w-5" />
			{unreadCount > 0 && (
				<span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
					{unreadCount > 9 ? "9+" : unreadCount}
				</span>
			)}
		</Button>
	);
}
