"use client";

import { cn } from "@repo/ui";
import { Activity, BarChart3, FileText, HelpCircle, Home, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";

interface NavItem {
	label: string;
	href: string;
	icon: React.ComponentType<{ size?: number }>;
}

const items: NavItem[] = [
	{ label: "Dashboard", href: "/", icon: Home },
	{ label: "Activity", href: "/activity", icon: Activity },
	{ label: "Insights", href: "/insights", icon: BarChart3 },
	{ label: "Vault", href: "/vault", icon: FileText },
	{ label: "Settings", href: "/settings", icon: Settings },
	{ label: "Support", href: "/support", icon: HelpCircle },
];

interface SidebarProps {
	user?: {
		name: string;
		email: string;
		avatar?: string;
	};
	team?: {
		name: string;
		slug: string;
		logo?: string;
	};
	onSignOut?: () => void;
}

export function Sidebar({ user, team }: SidebarProps) {
	const location = useLocation();
	const [isExpanded, setIsExpanded] = useState(false);

	const isActive = (href: string) => {
		if (href === "/") return location.pathname === "/";
		return location.pathname.startsWith(href);
	};

	return (
		<aside
			className={cn(
				"h-screen shrink-0 flex-col justify-between fixed top-0 left-0 pb-4 items-center hidden md:flex z-50 transition-all duration-200 ease-in-out",
				"bg-background border-r border-border",
				isExpanded ? "w-[240px]" : "w-[70px]",
			)}
			onMouseEnter={() => setIsExpanded(true)}
			onMouseLeave={() => setIsExpanded(false)}
		>
			{/* Logo header */}
			<div
				className={cn(
					"absolute top-0 left-0 h-[70px] flex items-center justify-center bg-background border-b border-border transition-all duration-200 ease-in-out",
					isExpanded ? "w-full" : "w-[69px]",
				)}
			>
				<Link to="/" className="absolute left-[22px] transition-none">
					<div className="w-6 h-6 bg-primary flex items-center justify-center">
						<span className="text-primary-foreground text-xs font-bold">
							{team?.name?.charAt(0) || "M"}
						</span>
					</div>
				</Link>
			</div>

			{/* Navigation */}
			<div className="flex flex-col w-full pt-[70px] flex-1 border-b border-border mb-3">
				<nav className="mt-6 w-full">
					<div className="flex flex-col gap-2">
						{items.map((item) => (
							<NavItem
								key={item.href}
								item={item}
								isActive={isActive(item.href)}
								isExpanded={isExpanded}
							/>
						))}
					</div>
				</nav>
			</div>

			{/* Team/User at bottom */}
			<div className="relative h-[32px]">
				<div className="fixed left-[19px] bottom-4 w-[32px] h-[32px]">
					<div
						className={cn(
							"w-[32px] h-[32px] rounded-none border border-[#DCDAD2] dark:border-[#2C2C2C] cursor-pointer flex items-center justify-center bg-accent",
						)}
					>
						{user?.avatar ? (
							<img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
						) : (
							<span className="text-xs font-medium">
								{team?.name?.charAt(0)?.toUpperCase()}
								{team?.name?.charAt(1)?.toUpperCase()}
							</span>
						)}
					</div>
				</div>

				{isExpanded && team && (
					<div className="fixed left-[62px] bottom-4 h-[32px] flex items-center">
						<span className="text-sm text-primary truncate transition-opacity duration-200 ease-in-out cursor-pointer hover:opacity-80">
							{team.name}
						</span>
					</div>
				)}
			</div>
		</aside>
	);
}

function NavItem({
	item,
	isActive,
	isExpanded,
}: {
	item: NavItem;
	isActive: boolean;
	isExpanded: boolean;
}) {
	const Icon = item.icon;

	return (
		<Link to={item.href} className="group">
			<div className="relative">
				{/* Background that expands */}
				<div
					className={cn(
						"border border-transparent h-[40px] transition-all duration-200 ease-in-out ml-[15px] mr-[15px]",
						isActive && "bg-[#f7f7f7] dark:bg-[#131313] border-[#e6e6e6] dark:border-[#1d1d1d]",
						isExpanded ? "w-[calc(100%-30px)]" : "w-[40px]",
					)}
				/>

				{/* Icon - always in same position from sidebar edge */}
				<div className="absolute top-0 left-[15px] w-[40px] h-[40px] flex items-center justify-center dark:text-[#666666] text-black group-hover:text-primary! pointer-events-none">
					<div className={cn(isActive && "dark:text-white!")}>
						<Icon size={20} />
					</div>
				</div>

				{isExpanded && (
					<div className="absolute top-0 left-[55px] right-[4px] h-[40px] flex items-center pointer-events-none">
						<span
							className={cn(
								"text-sm font-medium transition-opacity duration-200 ease-in-out text-[#666] group-hover:text-primary",
								"whitespace-nowrap overflow-hidden",
								isActive && "text-primary",
							)}
						>
							{item.label}
						</span>
					</div>
				)}
			</div>
		</Link>
	);
}
