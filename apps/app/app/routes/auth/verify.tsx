import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/verify";

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const token = url.searchParams.get("token");
	const type = url.searchParams.get("type") || "email";

	if (!token) {
		return { success: false, error: "Invalid verification link" };
	}

	// TODO: Implement verification
	// const result = await verifyToken(token, type);

	return { success: true, type };
}

export default function Verify() {
	const [searchParams] = useSearchParams();
	const type = searchParams.get("type") || "email";

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-sm space-y-6 text-center">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
					<svg
						className="h-6 w-6 text-success"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<div>
					<h1 className="text-2xl font-semibold">
						{type === "email" ? "Email verified" : "Verification complete"}
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						{type === "email"
							? "Your email has been verified successfully."
							: "Your account has been verified successfully."}
					</p>
				</div>
				<Link
					to="/sign-in"
					className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
				>
					Continue to sign in
				</Link>
			</div>
		</div>
	);
}
