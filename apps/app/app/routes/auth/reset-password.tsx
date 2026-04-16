import { Form, Link, useNavigation, useSearchParams } from "react-router";
import type { Route } from "./+types/reset-password";

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const password = formData.get("password") as string;
	const confirmPassword = formData.get("confirmPassword") as string;
	const url = new URL(request.url);
	const token = url.searchParams.get("token");

	if (password !== confirmPassword) {
		return { error: "Passwords do not match" };
	}

	if (!token) {
		return { error: "Invalid reset token" };
	}

	// TODO: Implement password reset
	// await resetPassword(token, password);

	return { success: true };
}

export default function ResetPassword() {
	const navigation = useNavigation();
	const [searchParams] = useSearchParams();
	const isSubmitting = navigation.state === "submitting";
	const token = searchParams.get("token");

	if (!token) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background p-4">
				<div className="w-full max-w-sm space-y-6 text-center">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
						<svg
							className="h-6 w-6 text-destructive"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</div>
					<div>
						<h1 className="text-2xl font-semibold">Invalid link</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							This password reset link is invalid or has expired.
						</p>
					</div>
					<Link
						to="/forgot-password"
						className="inline-block text-sm font-medium text-primary hover:underline"
					>
						Request a new link
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-sm space-y-6">
				<div className="text-center">
					<h1 className="text-2xl font-semibold">Reset password</h1>
					<p className="mt-2 text-sm text-muted-foreground">Enter your new password below</p>
				</div>

				<Form method="post" className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="password" className="text-sm font-medium">
							New password
						</label>
						<input
							type="password"
							id="password"
							name="password"
							required
							minLength={8}
							autoComplete="new-password"
							className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
							placeholder="••••••••"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="confirmPassword" className="text-sm font-medium">
							Confirm password
						</label>
						<input
							type="password"
							id="confirmPassword"
							name="confirmPassword"
							required
							minLength={8}
							autoComplete="new-password"
							className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
							placeholder="••••••••"
						/>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
					>
						{isSubmitting ? "Resetting..." : "Reset password"}
					</button>
				</Form>

				<p className="text-center text-sm text-muted-foreground">
					Remember your password?{" "}
					<Link to="/sign-in" className="font-medium text-primary hover:underline">
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
