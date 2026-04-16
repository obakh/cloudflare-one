"use client";

import { cn } from "@repo/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Bell, Search, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { ThemeToggle } from "~/components/theme-switch";

interface HeaderProps {
	className?: string;
	unreadCount?: number;
	onInboxClick?: () => void;
	onChatClick?: () => void;
	user?: {
		name: string;
		email: string;
		avatar?: string;
	};
	onSignOut?: () => void;
}

export function Header({
	className,
	unreadCount = 0,
	onInboxClick,
	onChatClick,
	user,
	onSignOut,
}: HeaderProps) {
	return (
		<header
			className={cn(
				"md:m-0 z-50 px-6 md:border-b border-border h-[70px] flex justify-between items-center top-0 backdrop-filter backdrop-blur-xl md:backdrop-filter md:backdrop-blur-none bg-background bg-opacity-70 transition-transform",
				className,
			)}
		>
			{/* Search button - Midday style */}
			<Button
				variant="outline"
				className="relative min-w-[250px] w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64 border-0 p-0 hover:bg-transparent font-normal no-drag hidden md:flex"
				onClick={() => {
					const event = new KeyboardEvent("keydown", {
						key: "k",
						ctrlKey: true,
						bubbles: true,
					});
					document.dispatchEvent(event);
				}}
			>
				<Search size={18} className="mr-2" />
				<span>Find anything...</span>
				<kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 border bg-accent px-1.5 text-[10px] font-medium sm:flex">
					<span className="text-xs">⌘</span>K
				</kbd>
			</Button>

			{/* Right side actions */}
			<div className="flex space-x-2 ml-auto items-center">
				{/* AI Chat button */}
				<Button
					variant="ghost"
					size="sm"
					onClick={onChatClick}
					className="text-muted-foreground hover:text-primary"
				>
					<Sparkles size={18} className="mr-2" />
					<span className="hidden sm:inline">Ask AI</span>
				</Button>

				{/* Notifications */}
				<Button
					variant="ghost"
					size="icon"
					onClick={onInboxClick}
					className="relative text-muted-foreground hover:text-primary"
				>
					<Bell size={18} />
					{unreadCount > 0 && (
						<span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</Button>

				{/* User Menu - Midday style */}
				{user && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Avatar className="rounded-full w-8 h-8 cursor-pointer bg-accent">
								{user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
								<AvatarFallback>
									<span className="text-xs">{user.name?.charAt(0)?.toUpperCase()}</span>
								</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-[240px]" sideOffset={10} align="end">
							<DropdownMenuLabel>
								<div className="flex justify-between items-center">
									<div className="flex flex-col">
										<span className="truncate line-clamp-1 max-w-[155px] block text-xs">
											{user.name}
										</span>
										<span className="truncate text-xs text-[#606060] font-normal">
											{user.email}
										</span>
									</div>
								</div>
							</DropdownMenuLabel>

							<DropdownMenuSeparator />

							<DropdownMenuGroup>
								<Link to="/account">
									<DropdownMenuItem className="text-xs">Account</DropdownMenuItem>
								</Link>
								<Link to="/support">
									<DropdownMenuItem className="text-xs">Support</DropdownMenuItem>
								</Link>
								<Link to="/settings">
									<DropdownMenuItem className="text-xs">Settings</DropdownMenuItem>
								</Link>
							</DropdownMenuGroup>

							<DropdownMenuSeparator />

							<div className="flex flex-row justify-between items-center p-2">
								<p className="text-xs">Theme</p>
								<ThemeToggle />
							</div>

							<DropdownMenuSeparator />

							<DropdownMenuItem className="text-xs" onClick={onSignOut}>
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</header>
	);
}
