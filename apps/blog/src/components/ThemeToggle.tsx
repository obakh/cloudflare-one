"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
	return (
		<button
			type="button"
			id="theme-toggle"
			className="rounded-md p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
			aria-label="Toggle theme"
		>
			<Sun size={18} className="dark:hidden" />
			<Moon size={18} className="hidden dark:block" />
		</button>
	);
}
