"use client";

import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	Label,
} from "@repo/ui";

export function SettingsForm() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>General Settings</CardTitle>
				<CardDescription>Configure your admin panel preferences</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-2">
					<Label htmlFor="site-name">Site Name</Label>
					<Input id="site-name" placeholder="My Admin Panel" />
				</div>
				<div className="grid gap-2">
					<Label htmlFor="admin-email">Admin Email</Label>
					<Input id="admin-email" type="email" placeholder="admin@example.com" />
				</div>
				<Button>Save Changes</Button>
			</CardContent>
		</Card>
	);
}
