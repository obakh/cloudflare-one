"use client";

import { Button, cn } from "@repo/ui";
import { Moon, Search, Sun } from "lucide-react";

interface HeaderProps {
	title: string;
}

export function Header({ title }: HeaderProps) {
	return (
		<header
			className={cn(
				"md:m-0 z-50 px-6 md:border-b border-border h-[70px] flex justify-between items-center top-0 backdrop-filter backdrop-blur-xl md:backdrop-filter md:backdrop-blur-none bg-background bg-opacity-70 transition-transform",
			)}
		>
			{/* Page title on mobile, search on desktop */}
			<div className="flex items-center">
				<h1 className="text-xl font-semibold md:hidden">{title}</h1>
				<Button
					variant="outline"
					className="relative min-w-[250px] w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64 border-0 p-0 hover:bg-transparent font-normal no-drag hidden md:flex"
				>
					<Search size={18} className="mr-2" />
					<span>Search...</span>
					<kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 border bg-accent px-1.5 text-[10px] font-medium sm:flex">
						<span className="text-xs">⌘</span>K
					</kbd>
				</Button>
			</div>

			{/* Right side actions */}
			<div className="flex space-x-2 ml-auto items-center">
				<ThemeToggle />
			</div>
		</header>
	);
}

function ThemeToggle() {
	return (
		<button
			type="button"
			id="theme-toggle"
			className="rounded-md p-2 hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
			aria-label="Toggle theme"
		>
			<Sun size={18} className="dark:hidden" />
			<Moon size={18} className="hidden dark:block" />
		</button>
	);
}
