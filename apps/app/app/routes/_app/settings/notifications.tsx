import { Button } from "@repo/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/card";
import { Switch } from "@repo/ui/switch";
import type { Route } from "./+types/notifications";

export async function loader({ context }: Route.LoaderArgs) {
	return {
		preferences: {
			email: {
				marketing: true,
				productUpdates: true,
				securityAlerts: true,
				weeklyDigest: false,
			},
			push: {
				mentions: true,
				comments: true,
				teamUpdates: false,
			},
		},
	};
}

export default function NotificationsSettings({ loaderData }: Route.ComponentProps) {
	const { preferences } = loaderData;

	return (
		<div className="space-y-6">
			{/* Email Notifications Card */}
			<form method="post">
				<Card>
					<CardHeader>
						<CardTitle>Email notifications</CardTitle>
						<CardDescription>Manage what emails you receive from us.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<NotificationToggle
							id="email-marketing"
							name="email.marketing"
							label="Marketing emails"
							description="Receive emails about new features and promotions."
							defaultChecked={preferences.email.marketing}
						/>
						<NotificationToggle
							id="email-product"
							name="email.productUpdates"
							label="Product updates"
							description="Get notified about important product changes."
							defaultChecked={preferences.email.productUpdates}
						/>
						<NotificationToggle
							id="email-security"
							name="email.securityAlerts"
							label="Security alerts"
							description="Receive alerts about security issues and login activity."
							defaultChecked={preferences.email.securityAlerts}
						/>
						<NotificationToggle
							id="email-digest"
							name="email.weeklyDigest"
							label="Weekly digest"
							description="Get a weekly summary of activity in your workspace."
							defaultChecked={preferences.email.weeklyDigest}
						/>
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button type="submit">Save</Button>
					</CardFooter>
				</Card>
			</form>

			{/* Push Notifications Card */}
			<form method="post">
				<Card>
					<CardHeader>
						<CardTitle>Push notifications</CardTitle>
						<CardDescription>Manage in-app and browser notifications.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<NotificationToggle
							id="push-mentions"
							name="push.mentions"
							label="Mentions"
							description="Get notified when someone mentions you."
							defaultChecked={preferences.push.mentions}
						/>
						<NotificationToggle
							id="push-comments"
							name="push.comments"
							label="Comments"
							description="Get notified about new comments on your items."
							defaultChecked={preferences.push.comments}
						/>
						<NotificationToggle
							id="push-team"
							name="push.teamUpdates"
							label="Team updates"
							description="Get notified about team member changes."
							defaultChecked={preferences.push.teamUpdates}
						/>
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button type="submit">Save</Button>
					</CardFooter>
				</Card>
			</form>
		</div>
	);
}

function NotificationToggle({
	id,
	name,
	label,
	description,
	defaultChecked,
}: {
	id: string;
	name: string;
	label: string;
	description: string;
	defaultChecked: boolean;
}) {
	return (
		<div className="flex items-start justify-between py-2">
			<div className="space-y-0.5">
				<label htmlFor={id} className="text-sm font-medium">
					{label}
				</label>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<Switch id={id} name={name} defaultChecked={defaultChecked} />
		</div>
	);
}

export const handle = {
	breadcrumb: "Notifications",
};
