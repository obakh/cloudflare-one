import { Link } from "react-router";

const features = [
	{
		title: "Invite your team",
		description: "Collaborate with your team members by inviting them to your workspace.",
		icon: (
			<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
				/>
			</svg>
		),
		href: "/settings/members",
	},
	{
		title: "Connect integrations",
		description: "Connect your favorite tools and services to streamline your workflow.",
		icon: (
			<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
				/>
			</svg>
		),
		href: "/settings/integrations",
	},
	{
		title: "Set up billing",
		description: "Choose a plan that works for your team and set up your payment method.",
		icon: (
			<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
				/>
			</svg>
		),
		href: "/settings/billing",
	},
];

export default function Welcome() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-2xl space-y-8">
				<div className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<svg
							className="h-8 w-8 text-primary"
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
					<h1 className="text-3xl font-semibold">Welcome to your workspace!</h1>
					<p className="mt-2 text-muted-foreground">
						Your workspace is ready. Here are some things you can do to get started.
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-3">
					{features.map((feature) => (
						<Link
							key={feature.title}
							to={feature.href}
							className="group rounded-lg border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-accent"
						>
							<div className="mb-4 text-muted-foreground group-hover:text-primary">
								{feature.icon}
							</div>
							<h3 className="font-medium">{feature.title}</h3>
							<p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
						</Link>
					))}
				</div>

				<div className="text-center">
					<Link
						to="/"
						className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						Go to dashboard
					</Link>
				</div>
			</div>
		</div>
	);
}
