"use client";

import { cn } from "@repo/ui";
import { Link, Outlet, useLocation } from "react-router";

const settingsNav = [
	{ label: "General", href: "/settings" },
	{ label: "Profile", href: "/settings/profile" },
	{ label: "Team", href: "/settings/team" },
	{ label: "Members", href: "/settings/members" },
	{ label: "Billing", href: "/settings/billing" },
	{ label: "Notifications", href: "/settings/notifications" },
	{ label: "Integrations", href: "/settings/integrations" },
	{ label: "API Keys", href: "/settings/api" },
	{ label: "Security", href: "/settings/security" },
	{ label: "Import", href: "/settings/import" },
];

export default function SettingsLayout() {
	const location = useLocation();

	const isActive = (href: string) => {
		if (href === "/settings") return location.pathname === "/settings";
		return location.pathname.startsWith(href);
	};

	return (
		<div className="max-w-[800px]">
			{/* Secondary Menu - Midday style */}
			<nav className="py-4">
				<ul className="flex space-x-6 text-sm overflow-auto scrollbar-hide">
					{settingsNav.map((item) => (
						<li key={item.href}>
							<Link
								to={item.href}
								className={cn(
									"text-[#606060] whitespace-nowrap",
									isActive(item.href) && "text-primary font-medium underline underline-offset-8",
								)}
							>
								{item.label}
							</Link>
						</li>
					))}
				</ul>
			</nav>

			{/* Settings Content */}
			<main className="mt-8">
				<Outlet />
			</main>
		</div>
	);
}

export const handle = {
	breadcrumb: "Settings",
};
