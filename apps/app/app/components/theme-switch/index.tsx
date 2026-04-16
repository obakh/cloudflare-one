"use client";

import { cn } from "@repo/ui";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeSwitchProps {
	className?: string;
}

// Midday-style theme switch (3 buttons in a row)
export function ThemeSwitch({ className }: ThemeSwitchProps) {
	const [theme, setTheme] = useState<Theme>("system");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const stored = localStorage.getItem("theme") as Theme | null;
		if (stored) setTheme(stored);
	}, []);

	useEffect(() => {
		if (!mounted) return;

		const root = document.documentElement;
		root.classList.remove("light", "dark");

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
			root.classList.add(systemTheme);
		} else {
			root.classList.add(theme);
		}

		localStorage.setItem("theme", theme);
	}, [theme, mounted]);

	if (!mounted) {
		return <div className="h-8 w-[84px]" />;
	}

	return (
		<div className={cn("flex items-center border", className)}>
			<button
				type="button"
				onClick={() => setTheme("light")}
				className={cn(
					"flex h-7 w-7 items-center justify-center transition-colors",
					theme === "light" ? "bg-accent text-primary" : "text-muted-foreground hover:text-primary",
				)}
				aria-label="Light mode"
			>
				<Sun size={14} />
			</button>
			<button
				type="button"
				onClick={() => setTheme("dark")}
				className={cn(
					"flex h-7 w-7 items-center justify-center transition-colors",
					theme === "dark" ? "bg-accent text-primary" : "text-muted-foreground hover:text-primary",
				)}
				aria-label="Dark mode"
			>
				<Moon size={14} />
			</button>
			<button
				type="button"
				onClick={() => setTheme("system")}
				className={cn(
					"flex h-7 w-7 items-center justify-center transition-colors",
					theme === "system"
						? "bg-accent text-primary"
						: "text-muted-foreground hover:text-primary",
				)}
				aria-label="System mode"
			>
				<Monitor size={14} />
			</button>
		</div>
	);
}

// Compact toggle version (for header icon)
export function ThemeToggle({ className }: ThemeSwitchProps) {
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const isDark = document.documentElement.classList.contains("dark");
		setTheme(isDark ? "dark" : "light");
	}, []);

	const toggle = () => {
		const newTheme = theme === "light" ? "dark" : "light";
		setTheme(newTheme);
		document.documentElement.classList.remove("light", "dark");
		document.documentElement.classList.add(newTheme);
		localStorage.setItem("theme", newTheme);
	};

	if (!mounted) return null;

	return (
		<button
			type="button"
			onClick={toggle}
			className={cn(
				"flex h-8 w-8 items-center justify-center hover:bg-accent transition-colors",
				className,
			)}
			aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
		>
			{theme === "light" ? (
				<Moon size={16} className="text-muted-foreground" />
			) : (
				<Sun size={16} className="text-muted-foreground" />
			)}
		</button>
	);
}
