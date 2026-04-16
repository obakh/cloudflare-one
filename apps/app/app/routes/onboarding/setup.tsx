import { Form, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/setup";

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const _teamName = formData.get("teamName") as string;
	const _teamSlug = formData.get("teamSlug") as string;

	// TODO: Create team and complete onboarding
	// await createTeam({ name: teamName, slug: teamSlug });

	return redirect("/welcome");
}

export default function Setup() {
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<h1 className="text-2xl font-semibold">Set up your workspace</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Create your team workspace to get started
					</p>
				</div>

				<Form method="post" className="space-y-6">
					<div className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="teamName" className="text-sm font-medium">
								Team name
							</label>
							<input
								type="text"
								id="teamName"
								name="teamName"
								required
								className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
								placeholder="Acme Inc"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="teamSlug" className="text-sm font-medium">
								Team URL
							</label>
							<div className="flex items-center">
								<span className="rounded-l-md border border-r-0 bg-muted px-3 py-2 text-sm text-muted-foreground">
									app.example.com/
								</span>
								<input
									type="text"
									id="teamSlug"
									name="teamSlug"
									required
									pattern="[a-z0-9-]+"
									className="w-full rounded-r-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
									placeholder="acme"
								/>
							</div>
							<p className="text-xs text-muted-foreground">
								Only lowercase letters, numbers, and hyphens
							</p>
						</div>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
					>
						{isSubmitting ? "Creating..." : "Create workspace"}
					</button>
				</Form>
			</div>
		</div>
	);
}
