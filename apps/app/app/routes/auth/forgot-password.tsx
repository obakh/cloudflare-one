import { Form, Link, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/forgot-password";

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const email = formData.get("email") as string;

	// TODO: Implement password reset email
	// await sendPasswordResetEmail(email);

	return { success: true, email };
}

export default function ForgotPassword() {
	const navigation = useNavigation();
	const actionData = useActionData<typeof action>();
	const isSubmitting = navigation.state === "submitting";

	if (actionData?.success) {
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
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<div>
						<h1 className="text-2xl font-semibold">Check your email</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							We've sent a password reset link to{" "}
							<span className="font-medium">{actionData.email}</span>
						</p>
					</div>
					<Link
						to="/sign-in"
						className="inline-block text-sm font-medium text-primary hover:underline"
					>
						Back to sign in
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-sm space-y-6">
				<div className="text-center">
					<h1 className="text-2xl font-semibold">Forgot password?</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Enter your email and we'll send you a reset link
					</p>
				</div>

				<Form method="post" className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium">
							Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							required
							autoComplete="email"
							className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
							placeholder="you@example.com"
						/>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
					>
						{isSubmitting ? "Sending..." : "Send reset link"}
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
