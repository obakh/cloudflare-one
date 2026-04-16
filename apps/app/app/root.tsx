import { ThemeProvider } from "@repo/ui";
import type { LinksFunction, MetaFunction } from "react-router";
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";
import "./styles/globals.css";

export const links: LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{ rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
	},
];

export const meta: MetaFunction = () => [
	{ title: "App" },
	{ name: "description", content: "Your SaaS application" },
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="h-full" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="h-full bg-background text-foreground antialiased">
				<ThemeProvider defaultTheme="system" storageKey="app-theme">
					{children}
				</ThemeProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: { error: unknown }) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	} else if (error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-4">
			<div className="text-center">
				<h1 className="text-4xl font-bold">{message}</h1>
				<p className="mt-2 text-muted-foreground">{details}</p>
				{stack && (
					<pre className="mt-4 max-w-2xl overflow-auto rounded bg-muted p-4 text-left text-sm">
						{stack}
					</pre>
				)}
			</div>
		</main>
	);
}
