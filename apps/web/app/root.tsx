import { ThemeProvider } from "@repo/ui";
import { isRouteErrorResponse, Outlet, Scripts, ScrollRestoration } from "react-router";

import indexStylesHref from "./index.css?url";

interface LayoutProps {
	children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="stylesheet" href={indexStylesHref} />
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								const storageKey = 'ui-theme';
								const stored = localStorage.getItem(storageKey);
								const theme = stored || 'system';
								
								let actualTheme = theme;
								if (theme === 'system') {
									actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
								}
								
								document.documentElement.classList.add(actualTheme);
							})();
						`,
					}}
				/>
			</head>
			<body className="bg-background text-foreground">
				<ThemeProvider defaultTheme="system">{children}</ThemeProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

interface ErrorBoundaryProps {
	error: unknown;
}

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4">{message}</h1>
				<p className="text-muted-foreground mb-4">{details}</p>
				{stack && (
					<pre className="text-left bg-muted p-4 rounded overflow-auto max-w-2xl">
						<code className="text-sm">{stack}</code>
					</pre>
				)}
			</div>
		</main>
	);
}

export function HydrateFallback() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<p className="text-muted-foreground">Loading...</p>
		</div>
	);
}

export default function App() {
	return <Outlet />;
}
