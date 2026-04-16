import { Button } from "@repo/ui";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log to error tracking service in production
		console.error("Error caught by boundary:", error, errorInfo);
		this.props.onError?.(error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<ErrorFallback
					error={this.state.error}
					onRetry={() => this.setState({ hasError: false })}
				/>
			);
		}

		return this.props.children;
	}
}

// Default error fallback component
interface ErrorFallbackProps {
	error?: Error;
	onRetry?: () => void;
	minimal?: boolean;
}

export function ErrorFallback({ error, onRetry, minimal }: ErrorFallbackProps) {
	if (minimal) {
		return <div className="p-2 text-xs text-muted-foreground">Error loading content</div>;
	}

	return (
		<div className="flex flex-col items-center justify-center border border-dashed p-8 text-center">
			<div className="flex h-12 w-12 items-center justify-center bg-destructive/10">
				<AlertTriangle className="h-6 w-6 text-destructive" />
			</div>
			<h3 className="mt-4 text-sm font-medium">Something went wrong</h3>
			<p className="mt-1 text-sm text-muted-foreground">
				{error?.message || "An unexpected error occurred"}
			</p>
			{onRetry && (
				<Button variant="outline" onClick={onRetry} className="mt-4">
					<RefreshCw className="h-4 w-4 mr-2" />
					Try again
				</Button>
			)}
		</div>
	);
}

// Page-level error component
interface PageErrorProps {
	title?: string;
	description?: string;
	onRetry?: () => void;
	onGoBack?: () => void;
}

export function PageError({
	title = "Page not found",
	description = "The page you're looking for doesn't exist or has been moved.",
	onRetry,
	onGoBack,
}: PageErrorProps) {
	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
			<div className="flex h-16 w-16 items-center justify-center bg-muted">
				<AlertTriangle className="h-8 w-8 text-muted-foreground" />
			</div>
			<h1 className="mt-6 text-2xl font-semibold">{title}</h1>
			<p className="mt-2 max-w-md text-muted-foreground">{description}</p>
			<div className="mt-6 flex gap-3">
				{onGoBack && (
					<Button variant="outline" onClick={onGoBack}>
						Go back
					</Button>
				)}
				{onRetry && <Button onClick={onRetry}>Try again</Button>}
			</div>
		</div>
	);
}
