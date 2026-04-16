import { Button } from "@repo/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import type { Route } from "./+types/general";

export async function loader({ context }: Route.LoaderArgs) {
	return {
		team: {
			name: "Acme Inc",
			slug: "acme",
			timezone: "America/New_York",
			language: "en",
		},
	};
}

export async function action({ request, context }: Route.ActionArgs) {
	const _formData = await request.formData();
	// TODO: Update team settings
	return { success: true };
}

export default function GeneralSettings({ loaderData }: Route.ComponentProps) {
	const { team } = loaderData;

	return (
		<div className="space-y-6">
			{/* Team Name Card */}
			<form method="post">
				<Card>
					<CardHeader>
						<CardTitle>Team name</CardTitle>
						<CardDescription>
							This is your team's visible name within the app. For example, the name of your company
							or department.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Input
							name="name"
							defaultValue={team.name}
							className="max-w-[300px]"
							autoComplete="off"
							maxLength={32}
						/>
					</CardContent>
					<CardFooter className="flex justify-between">
						<p className="text-sm text-muted-foreground">Please use 32 characters at maximum.</p>
						<Button type="submit">Save</Button>
					</CardFooter>
				</Card>
			</form>

			{/* Team URL Card */}
			<form method="post">
				<Card>
					<CardHeader>
						<CardTitle>Team URL</CardTitle>
						<CardDescription>This is your team's unique URL slug used in links.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center max-w-[300px]">
							<span className="rounded-l-md border border-r-0 bg-muted px-3 py-2 text-sm text-muted-foreground">
								app.example.com/
							</span>
							<Input name="slug" defaultValue={team.slug} className="rounded-l-none" />
						</div>
					</CardContent>
					<CardFooter className="flex justify-between">
						<p className="text-sm text-muted-foreground">
							Only lowercase letters, numbers, and hyphens.
						</p>
						<Button type="submit">Save</Button>
					</CardFooter>
				</Card>
			</form>

			{/* Timezone Card */}
			<form method="post">
				<Card>
					<CardHeader>
						<CardTitle>Timezone</CardTitle>
						<CardDescription>
							Set your team's default timezone for scheduling and reports.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Select name="timezone" defaultValue={team.timezone}>
							<SelectTrigger className="max-w-[300px]">
								<SelectValue placeholder="Select timezone" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
								<SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
								<SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
								<SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
								<SelectItem value="Europe/London">London (GMT)</SelectItem>
								<SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
								<SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
							</SelectContent>
						</Select>
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button type="submit">Save</Button>
					</CardFooter>
				</Card>
			</form>

			{/* Language Card */}
			<form method="post">
				<Card>
					<CardHeader>
						<CardTitle>Language</CardTitle>
						<CardDescription>Set the default language for your team's interface.</CardDescription>
					</CardHeader>
					<CardContent>
						<Select name="language" defaultValue={team.language}>
							<SelectTrigger className="max-w-[300px]">
								<SelectValue placeholder="Select language" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="en">English</SelectItem>
								<SelectItem value="es">Spanish</SelectItem>
								<SelectItem value="fr">French</SelectItem>
								<SelectItem value="de">German</SelectItem>
								<SelectItem value="ja">Japanese</SelectItem>
							</SelectContent>
						</Select>
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button type="submit">Save</Button>
					</CardFooter>
				</Card>
			</form>

			{/* Danger Zone */}
			<Card className="border-destructive/50">
				<CardHeader>
					<CardTitle className="text-destructive">Delete team</CardTitle>
					<CardDescription>
						Once you delete your team, there is no going back. Please be certain.
					</CardDescription>
				</CardHeader>
				<CardFooter>
					<Button
						type="button"
						variant="outline"
						className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
					>
						Delete Team
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

export const handle = {
	breadcrumb: "General",
};
