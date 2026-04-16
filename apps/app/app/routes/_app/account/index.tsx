import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
	// TODO: Get current user
	return {
		user: {
			id: "1",
			name: "John Doe",
			email: "john@example.com",
			avatar: null,
			createdAt: new Date().toISOString(),
		},
	};
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "update-profile") {
		const _name = formData.get("name") as string;
		const _email = formData.get("email") as string;
		// TODO: Update user profile
		return { success: true };
	}

	if (intent === "delete-account") {
		// TODO: Delete user account
		return { success: true };
	}

	return { error: "Invalid action" };
}

export default function Account({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData;
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-semibold">Account</h1>
				<p className="mt-1 text-sm text-muted-foreground">Manage your personal account settings</p>
			</div>

			<div className="space-y-6">
				<div className="rounded-lg border bg-card">
					<div className="border-b p-6">
						<h2 className="font-medium">Profile</h2>
						<p className="mt-1 text-sm text-muted-foreground">Update your personal information</p>
					</div>
					<Form method="post" className="p-6">
						<input type="hidden" name="intent" value="update-profile" />
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-medium">
									{user.name.charAt(0)}
								</div>
								<button
									type="button"
									className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
								>
									Change avatar
								</button>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<label htmlFor="name" className="text-sm font-medium">
										Name
									</label>
									<input
										type="text"
										id="name"
										name="name"
										defaultValue={user.name}
										className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
									/>
								</div>
								<div className="space-y-2">
									<label htmlFor="email" className="text-sm font-medium">
										Email
									</label>
									<input
										type="email"
										id="email"
										name="email"
										defaultValue={user.email}
										className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
									/>
								</div>
							</div>

							<div className="flex justify-end">
								<button
									type="submit"
									disabled={isSubmitting}
									className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
								>
									{isSubmitting ? "Saving..." : "Save changes"}
								</button>
							</div>
						</div>
					</Form>
				</div>

				<div className="rounded-lg border border-destructive/50 bg-card">
					<div className="border-b border-destructive/50 p-6">
						<h2 className="font-medium text-destructive">Danger zone</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Irreversible and destructive actions
						</p>
					</div>
					<div className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Delete account</p>
								<p className="text-sm text-muted-foreground">
									Permanently delete your account and all associated data
								</p>
							</div>
							<Form method="post">
								<input type="hidden" name="intent" value="delete-account" />
								<button
									type="submit"
									className="rounded-md border border-destructive bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
								>
									Delete account
								</button>
							</Form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
