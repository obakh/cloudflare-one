"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
	disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	resolvedTheme: "dark" | "light";
};

const initialState: ThemeProviderState = {
	theme: "system",
	setTheme: () => null,
	resolvedTheme: "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "ui-theme",
	disableTransitionOnChange = false,
	...props
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(defaultTheme);
	const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");

	// Load theme from storage on mount
	useEffect(() => {
		const stored = localStorage.getItem(storageKey) as Theme | null;
		if (stored) {
			setTheme(stored);
		}
	}, [storageKey]);

	// Apply theme to DOM
	useEffect(() => {
		const root = window.document.documentElement;

		// Disable transitions during theme change
		if (disableTransitionOnChange) {
			root.classList.add("[&_*]:!transition-none");
		}

		root.classList.remove("light", "dark");

		const applyTheme = (actualTheme: "dark" | "light") => {
			root.classList.add(actualTheme);
			setResolvedTheme(actualTheme);
		};

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
			applyTheme(systemTheme);
		} else {
			applyTheme(theme);
		}

		// Re-enable transitions
		if (disableTransitionOnChange) {
			setTimeout(() => {
				root.classList.remove("[&_*]:!transition-none");
			}, 0);
		}
	}, [theme, disableTransitionOnChange]);

	// Listen for system theme changes
	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = (e: MediaQueryListEvent) => {
			const root = window.document.documentElement;
			root.classList.remove("light", "dark");
			const newTheme = e.matches ? "dark" : "light";
			root.classList.add(newTheme);
			setResolvedTheme(newTheme);
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	const value = {
		theme,
		resolvedTheme,
		setTheme: (newTheme: Theme) => {
			localStorage.setItem(storageKey, newTheme);
			setTheme(newTheme);
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};
