import { Button } from "@repo/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/card";
import { Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Route } from "./+types/api";

export async function loader({ context }: Route.LoaderArgs) {
	return {
		apiKeys: [
			{
				id: "key_1",
				name: "Production API Key",
				prefix: "sk_live_",
				lastUsed: "2024-06-10",
				createdAt: "2024-01-15",
			},
			{
				id: "key_2",
				name: "Development API Key",
				prefix: "sk_test_",
				lastUsed: "2024-06-12",
				createdAt: "2024-03-20",
			},
		],
	};
}

export default function ApiSettings({ loaderData }: Route.ComponentProps) {
	const { apiKeys } = loaderData;
	const [_showCreateModal, setShowCreateModal] = useState(false);

	return (
		<div className="space-y-6">
			{/* API Keys Card */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0">
					<div>
						<CardTitle>API keys</CardTitle>
						<CardDescription>
							Manage API keys for programmatic access to your account.
						</CardDescription>
					</div>
					<Button type="button" onClick={() => setShowCreateModal(true)}>
						Create API Key
					</Button>
				</CardHeader>
				<CardContent className="p-0">
					<div className="divide-y">
						{apiKeys.map(
							(key: {
								id: string;
								name: string;
								prefix: string;
								lastUsed: string;
								createdAt: string;
							}) => (
								<ApiKeyRow key={key.id} apiKey={key} />
							),
						)}
					</div>
				</CardContent>
			</Card>

			{/* API Documentation Card */}
			<Card className="bg-muted/50">
				<CardHeader>
					<CardTitle>API documentation</CardTitle>
					<CardDescription>
						Learn how to use our API to integrate with your applications.
					</CardDescription>
				</CardHeader>
				<CardFooter>
					<a href="/docs/api" className="text-sm font-medium text-primary hover:underline">
						View API Documentation →
					</a>
				</CardFooter>
			</Card>

			{/* Rate Limits Card */}
			<Card>
				<CardHeader>
					<CardTitle>Rate limits</CardTitle>
					<CardDescription>
						Your current plan allows up to 1,000 API requests per minute.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Current usage</span>
						<span className="font-medium">234 / 1,000 requests</span>
					</div>
					<div className="mt-2 h-2 rounded-full bg-muted">
						<div className="h-full w-[23%] rounded-full bg-primary" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function ApiKeyRow({
	apiKey,
}: {
	apiKey: { id: string; name: string; prefix: string; lastUsed: string; createdAt: string };
}) {
	const [showKey, setShowKey] = useState(false);
	const [copied, setCopied] = useState(false);

	const maskedKey = `${apiKey.prefix}${"•".repeat(24)}`;
	const displayKey = showKey ? `${apiKey.prefix}xxxxxxxxxxxxxxxxxxxx` : maskedKey;

	const handleCopy = () => {
		navigator.clipboard.writeText(displayKey);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="p-4">
			<div className="flex items-center justify-between">
				<div>
					<h4 className="text-sm font-medium">{apiKey.name}</h4>
					<div className="mt-1 flex items-center gap-2">
						<code className="rounded bg-muted px-2 py-0.5 text-sm font-mono">{displayKey}</code>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => setShowKey(!showKey)}
							aria-label={showKey ? "Hide key" : "Show key"}
						>
							{showKey ? (
								<EyeOff className="h-4 w-4 text-muted-foreground" />
							) : (
								<Eye className="h-4 w-4 text-muted-foreground" />
							)}
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={handleCopy}
							aria-label="Copy key"
						>
							<Copy className="h-4 w-4 text-muted-foreground" />
						</Button>
						{copied && <span className="text-xs text-success">Copied!</span>}
					</div>
				</div>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="text-destructive hover:bg-destructive/10"
					aria-label="Delete key"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
			<div className="mt-2 flex gap-4 text-xs text-muted-foreground">
				<span>Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>
				<span>Last used {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
			</div>
		</div>
	);
}

export const handle = {
	breadcrumb: "API Keys",
};
