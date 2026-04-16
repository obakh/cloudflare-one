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
import { useState } from "react";
import { AvatarUpload } from "~/components/avatar-upload";
import { DeleteAccountDialog } from "~/components/delete-dialogs";
import type { Route } from "./+types/profile";

export async function loader({ context }: Route.LoaderArgs) {
	return {
		user: {
			name: "John Doe",
			email: "john@example.com",
			avatar: null,
		},
	};
}

export default function ProfileSettings({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData;
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const handleAvatarUpload = async (file: File): Promise<string | undefined> => {
		// TODO: Upload to storage via @repo/storage
		console.log("Uploading avatar:", file.name);
		// Return URL after upload
		return undefined;
	};

	const handleDeleteAccount = async () => {
		// TODO: Delete account via API
		console.log("Deleting account...");
	};

	return (
		<div className="space-y-6">
			{/* Avatar Card */}
			<Card>
				<CardHeader>
					<CardTitle>Avatar</CardTitle>
					<CardDescription>
						This is your avatar. Click to upload a custom one from your files.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<AvatarUpload currentUrl={user.avatar} size={64} onUpload={handleAvatarUpload} />
						<div>
							<p className="text-sm text-muted-foreground">JPG, GIF or PNG. Max size 5MB.</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Display Name Card */}
			<form method="post">
				<Card>
					<CardHeader>
						<CardTitle>Display name</CardTitle>
						<CardDescription>
							Please enter your full name, or a display name you are comfortable with.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Input
							name="name"
							defaultValue={user.name}
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

			{/* Email Card */}
			<form method="post">
				<Card>
					<CardHeader>
						<CardTitle>Email</CardTitle>
						<CardDescription>Enter the email address you want to use to log in.</CardDescription>
					</CardHeader>
					<CardContent>
						<Input
							type="email"
							name="email"
							defaultValue={user.email}
							className="max-w-[300px]"
							autoComplete="off"
						/>
					</CardContent>
					<CardFooter className="flex justify-between">
						<p className="text-sm text-muted-foreground">
							We'll send a verification email to confirm any changes.
						</p>
						<Button type="submit">Save</Button>
					</CardFooter>
				</Card>
			</form>

			{/* Password Card */}
			<Card>
				<CardHeader>
					<CardTitle>Password</CardTitle>
					<CardDescription>Update your password to keep your account secure.</CardDescription>
				</CardHeader>
				<CardFooter>
					<Button type="button" variant="outline">
						Change Password
					</Button>
				</CardFooter>
			</Card>

			{/* Delete Account Card */}
			<Card className="border-destructive/50">
				<CardHeader>
					<CardTitle className="text-destructive">Delete account</CardTitle>
					<CardDescription>
						Permanently delete your account and all associated data. This action cannot be undone.
					</CardDescription>
				</CardHeader>
				<CardFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setShowDeleteDialog(true)}
						className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
					>
						Delete Account
					</Button>
				</CardFooter>
			</Card>

			{/* Delete Account Dialog */}
			<DeleteAccountDialog
				isOpen={showDeleteDialog}
				onClose={() => setShowDeleteDialog(false)}
				onConfirm={handleDeleteAccount}
			/>
		</div>
	);
}

export const handle = {
	breadcrumb: "Profile",
};
