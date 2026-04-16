import { redirect } from "react-router";
import type { Route } from "./+types/callback";

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const _state = url.searchParams.get("state");
	const error = url.searchParams.get("error");
	const _provider = url.searchParams.get("provider") || "oauth";

	if (error) {
		return redirect(`/sign-in?error=${encodeURIComponent(error)}`);
	}

	if (!code) {
		return redirect("/sign-in?error=missing_code");
	}

	// TODO: Exchange code for tokens and create session
	// const session = await exchangeCodeForSession(code, state, provider);

	// Redirect to dashboard or onboarding based on user state
	return redirect("/");
}

export default function Callback() {
	// This should not render as the loader redirects
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="flex items-center gap-2">
				<svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					/>
				</svg>
				<span className="text-sm text-muted-foreground">Completing sign in...</span>
			</div>
		</div>
	);
}
