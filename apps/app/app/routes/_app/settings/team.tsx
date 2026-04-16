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
import { Textarea } from "@repo/ui/textarea";
import { useState } from "react";
import { LogoUpload } from "~/components/avatar-upload";
import { DeleteTeamDialog } from "~/components/delete-dialogs";
import type { Route } from "./+types/team";

export async function loader({ context }: Route.LoaderArgs) {
	return {
		team: {
			name: "Acme Inc",
			slug: "acme",
			logo: null,
			description: "Building the future of productivity.",
			website: "https://acme.com",
			industry: "technology",
			size: "11-50",
		},
		hasActiveSubscription: true,
	};
}

export default function TeamSettings({ loaderData }: Route.ComponentProps) {
	const { team, hasActiveSubscription } = loaderData;
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const handleLogoUpload = async (file: File): Promise<string | undefined> => {
		// TODO: Upload to storage via @repo/storage
		console.log("Uploading logo:", file.name);
		return undefined;
	};

	const handleDeleteTeam = async () => {
		// TODO: Delete team via API
		console.log("Deleting team...");
	};

	return (
		<div className="space-y-6">
			{/* Logo Card */}
			<Card>
				<CardHeader>
					<CardTitle>Team logo</CardTitle>
					<CardDescription>
						This is your team's logo. Click to upload a custom one from your files.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<LogoUpload currentUrl={team.logo} onUpload={handleLogoUpload} />
						<div>
							<p className="text-sm text-muted-foreground">Recommended: 256x256px PNG or SVG.</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Description Card */}
			<form method="post">
				<Card>
					<CardHeader>
						<CardTitle>Description</CardTitle>
						<CardDescription>A brief description of your team or company.</CardDescription>
					</CardHeader>
					<CardContent>
						<Textarea
							name="description"
							defaultValue={team.description}
							className="max-w-[500px]"
							rows={3}
							placeholder="Tell us about your team..."
						/>
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button type="submit">Save</Button>
					</CardFooter>
				</Card>
			</form>

			{/* Website Card */}
			<form method="post">
				<Card>
					<CardHeader>
						<CardTitle>Website</CardTitle>
						<CardDescription>Your team's website URL.</CardDescription>
					</CardHeader>
					<CardContent>
						<Input
							type="url"
							name="website"
							defaultValue={team.website}
							className="max-w-[300px]"
							placeholder="https://example.com"
						/>
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button type="submit">Save</Button>
					</CardFooter>
				</Card>
			</form>

			{/* Industry Card */}
			<form method="post">
				<Card>
					<CardHeader>
						<CardTitle>Industry</CardTitle>
						<CardDescription>Select the industry that best describes your team.</CardDescription>
					</CardHeader>
					<CardContent>
						<Select name="industry" defaultValue={team.industry}>
							<SelectTrigger className="max-w-[300px]">
								<SelectValue placeholder="Select an industry" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="technology">Technology</SelectItem>
								<SelectItem value="finance">Finance</SelectItem>
								<SelectItem value="healthcare">Healthcare</SelectItem>
								<SelectItem value="education">Education</SelectItem>
								<SelectItem value="retail">Retail</SelectItem>
								<SelectItem value="manufacturing">Manufacturing</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button type="submit">Save</Button>
					</CardFooter>
				</Card>
			</form>

			{/* Team Size Card */}
			<form method="post">
				<Card>
					<CardHeader>
						<CardTitle>Team size</CardTitle>
						<CardDescription>How many people are on your team?</CardDescription>
					</CardHeader>
					<CardContent>
						<Select name="size" defaultValue={team.size}>
							<SelectTrigger className="max-w-[300px]">
								<SelectValue placeholder="Select team size" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1-10">1-10 employees</SelectItem>
								<SelectItem value="11-50">11-50 employees</SelectItem>
								<SelectItem value="51-200">51-200 employees</SelectItem>
								<SelectItem value="201-500">201-500 employees</SelectItem>
								<SelectItem value="500+">500+ employees</SelectItem>
							</SelectContent>
						</Select>
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button type="submit">Save</Button>
					</CardFooter>
				</Card>
			</form>

			{/* Delete Team Card */}
			<Card className="border-destructive/50">
				<CardHeader>
					<CardTitle className="text-destructive">Delete team</CardTitle>
					<CardDescription>
						Permanently delete this team and all associated data. This action cannot be undone.
					</CardDescription>
				</CardHeader>
				<CardFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setShowDeleteDialog(true)}
						className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
					>
						Delete Team
					</Button>
				</CardFooter>
			</Card>

			{/* Delete Team Dialog */}
			<DeleteTeamDialog
				isOpen={showDeleteDialog}
				onClose={() => setShowDeleteDialog(false)}
				onConfirm={handleDeleteTeam}
				hasActiveSubscription={hasActiveSubscription}
			/>
		</div>
	);
}

export const handle = {
	breadcrumb: "Team",
};
