import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { Chat, useChat } from "~/components/chat";
import { CommandPalette, useCommandPalette } from "~/components/command-palette";
import { Header } from "~/components/header";
import { Inbox } from "~/components/inbox";
import { Sidebar } from "~/components/sidebar";
import type { Route } from "./+types/layout";

// Mock data - in production, fetch from database
const mockNotifications = [
	{
		id: "1",
		type: "info" as const,
		title: "New team member",
		description: "Jane Smith has joined your team.",
		timestamp: "2 hours ago",
		read: false,
	},
	{
		id: "2",
		type: "success" as const,
		title: "Payment received",
		description: "Your subscription payment of $29 was successful.",
		timestamp: "1 day ago",
		read: false,
	},
	{
		id: "3",
		type: "warning" as const,
		title: "Storage limit",
		description: "You're approaching your storage limit. Consider upgrading.",
		timestamp: "2 days ago",
		read: true,
	},
];

export async function loader({ request, context }: Route.LoaderArgs) {
	// Real implementation with @repo/auth:
	// const env = getEnv(context);
	// const auth = getAuth(env);
	// const session = await auth.api.getSession({ headers: request.headers });
	// if (!session?.user) throw redirect("/sign-in");

	// Mock user for development
	const user = {
		id: "user_123",
		name: "John Doe",
		email: "john@example.com",
	};

	const team = {
		id: "team_123",
		name: "Acme Inc",
		slug: "acme",
	};

	return {
		user,
		team,
		notifications: mockNotifications,
	};
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
	const { user, team, notifications } = loaderData;
	const navigate = useNavigate();
	const { isOpen: isCommandOpen, close: closeCommand } = useCommandPalette();
	const { isOpen: isChatOpen, open: openChat, close: closeChat } = useChat();
	const [isInboxOpen, setIsInboxOpen] = useState(false);
	const [notificationList, setNotificationList] = useState(notifications);

	const handleSignOut = async () => {
		// TODO: Implement sign out with @repo/auth
		navigate("/sign-in");
	};

	const handleMarkAsRead = (id: string) => {
		setNotificationList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
	};

	const handleMarkAllAsRead = () => {
		setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));
	};

	const handleDeleteNotification = (id: string) => {
		setNotificationList((prev) => prev.filter((n) => n.id !== id));
	};

	const unreadCount = notificationList.filter((n) => !n.read).length;

	return (
		<div className="relative min-h-screen bg-background">
			<Sidebar user={user} team={team} onSignOut={handleSignOut} />

			<div className="md:ml-[70px] pb-4">
				<Header
					unreadCount={unreadCount}
					onInboxClick={() => setIsInboxOpen(true)}
					onChatClick={openChat}
					user={user}
					onSignOut={handleSignOut}
				/>
				<div className="px-4 md:px-8">
					<Outlet />
				</div>
			</div>

			{/* Command Palette */}
			<CommandPalette isOpen={isCommandOpen} onClose={closeCommand} onSignOut={handleSignOut} />

			{/* AI Chat */}
			<Chat isOpen={isChatOpen} onClose={closeChat} />

			{/* Inbox Slide-over */}
			{isInboxOpen && (
				<>
					<button
						type="button"
						className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm cursor-default"
						onClick={() => setIsInboxOpen(false)}
						onKeyDown={(e) => e.key === "Escape" && setIsInboxOpen(false)}
						aria-label="Close inbox"
					/>
					<div className="fixed right-0 top-0 z-50 h-full w-96 border-l bg-background shadow-lg">
						<Inbox
							notifications={notificationList}
							onMarkAsRead={handleMarkAsRead}
							onMarkAllAsRead={handleMarkAllAsRead}
							onDelete={handleDeleteNotification}
							onClose={() => setIsInboxOpen(false)}
						/>
					</div>
				</>
			)}
		</div>
	);
}

export const handle = {
	breadcrumb: "Home",
};
