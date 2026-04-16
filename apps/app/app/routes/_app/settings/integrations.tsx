import { Button } from "@repo/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/card";
import type { Route } from "./+types/integrations";

export async function loader(_args: Route.LoaderArgs) {
	return {
		integrations: [
			{
				id: "slack",
				name: "Slack",
				description: "Get notifications and updates in Slack.",
				icon: "🔔",
				connected: true,
				connectedAt: "2024-03-15",
			},
			{
				id: "github",
				name: "GitHub",
				description: "Connect your repositories and track issues.",
				icon: "🐙",
				connected: false,
			},
			{
				id: "linear",
				name: "Linear",
				description: "Sync issues and projects with Linear.",
				icon: "📋",
				connected: false,
			},
			{
				id: "notion",
				name: "Notion",
				description: "Embed and sync content from Notion.",
				icon: "📝",
				connected: true,
				connectedAt: "2024-04-20",
			},
			{
				id: "figma",
				name: "Figma",
				description: "Preview and embed Figma designs.",
				icon: "🎨",
				connected: false,
			},
			{
				id: "zapier",
				name: "Zapier",
				description: "Connect with 5,000+ apps via Zapier.",
				icon: "⚡",
				connected: false,
			},
		],
	};
}

export default function IntegrationsSettings({ loaderData }: Route.ComponentProps) {
	const { integrations } = loaderData;

	type Integration = {
		id: string;
		name: string;
		description: string;
		icon: string;
		connected: boolean;
		connectedAt?: string;
	};
	const connected = integrations.filter((i: Integration) => i.connected);
	const available = integrations.filter((i: Integration) => !i.connected);

	return (
		<div className="space-y-6">
			{/* Connected Integrations Card */}
			{connected.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Connected integrations</CardTitle>
						<CardDescription>
							Integrations that are currently active on your account.
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<div className="divide-y">
							{connected.map((integration: Integration) => (
								<div key={integration.id} className="flex items-center justify-between p-4">
									<div className="flex items-center gap-3">
										<span className="text-2xl">{integration.icon}</span>
										<div>
											<h4 className="text-sm font-medium">{integration.name}</h4>
											<p className="text-sm text-muted-foreground">{integration.description}</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<span className="text-xs text-muted-foreground">
											Connected {new Date(integration.connectedAt!).toLocaleDateString()}
										</span>
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
										>
											Disconnect
										</Button>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Available Integrations Card */}
			<Card>
				<CardHeader>
					<CardTitle>Available integrations</CardTitle>
					<CardDescription>Connect your favorite tools and services.</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					<div className="divide-y">
						{available.map((integration: Integration) => (
							<div key={integration.id} className="flex items-center justify-between p-4">
								<div className="flex items-center gap-3">
									<span className="text-2xl">{integration.icon}</span>
									<div>
										<h4 className="text-sm font-medium">{integration.name}</h4>
										<p className="text-sm text-muted-foreground">{integration.description}</p>
									</div>
								</div>
								<Button type="button" size="sm">
									Connect
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Custom Webhooks Card */}
			<Card>
				<CardHeader>
					<CardTitle>Custom webhooks</CardTitle>
					<CardDescription>
						Send events to your own endpoints for custom integrations.
					</CardDescription>
				</CardHeader>
				<CardFooter>
					<Button type="button" variant="outline">
						Add Webhook
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

export const handle = {
	breadcrumb: "Integrations",
};
