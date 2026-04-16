import { Building2, Check } from "lucide-react";
import { useState } from "react";
import { Form, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/create-team";

export async function loader({ request, context }: Route.LoaderArgs) {
	// Check if user is authenticated
	// const user = await requireAuth(request, env);
	return {};
}

export async function action({ request, context }: Route.ActionArgs) {
	const formData = await request.formData();
	const _name = formData.get("name") as string;
	const _slug = formData.get("slug") as string;
	const _size = formData.get("size") as string;
	const _industry = formData.get("industry") as string;

	// Real implementation:
	// const env = getEnv(context);
	// const user = await requireAuth(request, env);
	// const team = await createTeam({ name, slug, size, industry, ownerId: user.id });
	// await addUserToTeam(user.id, team.id, "owner");

	return redirect("/");
}

const teamSizes = [
	{ value: "1", label: "Just me" },
	{ value: "2-10", label: "2-10" },
	{ value: "11-50", label: "11-50" },
	{ value: "51-200", label: "51-200" },
	{ value: "201+", label: "201+" },
];

const industries = [
	{ value: "technology", label: "Technology" },
	{ value: "finance", label: "Finance" },
	{ value: "healthcare", label: "Healthcare" },
	{ value: "education", label: "Education" },
	{ value: "ecommerce", label: "E-commerce" },
	{ value: "marketing", label: "Marketing" },
	{ value: "consulting", label: "Consulting" },
	{ value: "other", label: "Other" },
];

export default function CreateTeam() {
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [selectedSize, setSelectedSize] = useState("");

	const generateSlug = (teamName: string) => {
		return teamName
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
	};

	const handleNameChange = (value: string) => {
		setName(value);
		if (!slug || slug === generateSlug(name)) {
			setSlug(generateSlug(value));
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-lg space-y-8">
				{/* Header */}
				<div className="text-center">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
						<Building2 className="h-6 w-6 text-primary" />
					</div>
					<h1 className="mt-4 text-2xl font-semibold">Create your team</h1>
					<p className="mt-2 text-muted-foreground">
						Set up your workspace to collaborate with your team.
					</p>
				</div>

				{/* Form */}
				<Form method="post" className="space-y-6">
					{/* Team Name */}
					<div className="space-y-2">
						<label htmlFor="name" className="text-sm font-medium">
							Team name
						</label>
						<input
							type="text"
							id="name"
							name="name"
							value={name}
							onChange={(e) => handleNameChange(e.target.value)}
							required
							placeholder="Acme Inc"
							className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>

					{/* Team Slug */}
					<div className="space-y-2">
						<label htmlFor="slug" className="text-sm font-medium">
							Team URL
						</label>
						<div className="flex items-center">
							<span className="rounded-l-md border border-r-0 bg-muted px-3 py-2 text-sm text-muted-foreground">
								app.example.com/
							</span>
							<input
								type="text"
								id="slug"
								name="slug"
								value={slug}
								onChange={(e) => setSlug(e.target.value)}
								required
								placeholder="acme"
								className="w-full rounded-r-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
						<p className="text-xs text-muted-foreground">
							This will be your team's unique identifier.
						</p>
					</div>

					{/* Team Size */}
					<fieldset className="space-y-2">
						<legend className="text-sm font-medium">Team size</legend>
						<div className="grid grid-cols-5 gap-2">
							{teamSizes.map((size) => (
								<button
									key={size.value}
									type="button"
									onClick={() => setSelectedSize(size.value)}
									className={`rounded-md border px-3 py-2 text-sm transition-colors ${
										selectedSize === size.value
											? "border-primary bg-primary/10 text-primary"
											: "hover:bg-accent"
									}`}
								>
									{size.label}
								</button>
							))}
						</div>
						<input type="hidden" name="size" value={selectedSize} />
					</fieldset>

					{/* Industry */}
					<div className="space-y-2">
						<label htmlFor="industry" className="text-sm font-medium">
							Industry
						</label>
						<select
							id="industry"
							name="industry"
							className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
						>
							<option value="">Select an industry</option>
							{industries.map((industry) => (
								<option key={industry.value} value={industry.value}>
									{industry.label}
								</option>
							))}
						</select>
					</div>

					{/* Features Preview */}
					<div className="rounded-lg border bg-muted/50 p-4">
						<h3 className="text-sm font-medium">What you'll get</h3>
						<ul className="mt-3 space-y-2">
							{[
								"Unlimited team members",
								"Shared workspace",
								"Team analytics",
								"Role-based permissions",
							].map((feature) => (
								<li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
									<Check className="h-4 w-4 text-success" />
									{feature}
								</li>
							))}
						</ul>
					</div>

					{/* Submit */}
					<button
						type="submit"
						disabled={isSubmitting || !name || !slug}
						className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
					>
						{isSubmitting ? "Creating team..." : "Create team"}
					</button>
				</Form>

				{/* Skip */}
				<p className="text-center text-sm text-muted-foreground">
					Want to join an existing team?{" "}
					<a href="/onboarding/join-team" className="text-primary hover:underline">
						Enter invite code
					</a>
				</p>
			</div>
		</div>
	);
}
