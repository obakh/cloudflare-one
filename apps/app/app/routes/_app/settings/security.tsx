import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { KeyRound, Shield, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { useState } from "react";
import { Form } from "react-router";
import type { Route } from "./+types/security";

export async function loader({ context }: Route.LoaderArgs) {
	return {
		mfaEnabled: true,
		mfaMethods: [
			{
				id: "totp_1",
				type: "totp" as const,
				name: "Authenticator App",
				createdAt: "2024-01-15",
				lastUsed: "2024-06-10",
			},
		],
		sessions: [
			{
				id: "sess_1",
				device: "Chrome on Windows",
				location: "New York, US",
				lastActive: "Just now",
				current: true,
			},
			{
				id: "sess_2",
				device: "Safari on iPhone",
				location: "New York, US",
				lastActive: "2 hours ago",
				current: false,
			},
			{
				id: "sess_3",
				device: "Firefox on MacOS",
				location: "San Francisco, US",
				lastActive: "3 days ago",
				current: false,
			},
		],
		recentActivity: [
			{ id: "1", action: "Sign in", device: "Chrome on Windows", time: "Just now", success: true },
			{
				id: "2",
				action: "Password changed",
				device: "Chrome on Windows",
				time: "2 days ago",
				success: true,
			},
			{
				id: "3",
				action: "Sign in attempt",
				device: "Unknown device",
				time: "5 days ago",
				success: false,
			},
		],
	};
}

export async function action({ request, context }: Route.ActionArgs) {
	const formData = await request.formData();
	const intent = formData.get("intent");

	switch (intent) {
		case "enable-mfa":
			return { success: true, step: "verify" };
		case "verify-mfa":
			return { success: true };
		case "disable-mfa":
			return { success: true };
		case "revoke-session":
			return { success: true };
		case "revoke-all-sessions":
			return { success: true };
		default:
			return { error: "Invalid action" };
	}
}

export default function SecuritySettings({ loaderData }: Route.ComponentProps) {
	const { mfaEnabled, mfaMethods, sessions, recentActivity } = loaderData;
	const [showMfaSetup, setShowMfaSetup] = useState(false);

	return (
		<div className="space-y-6">
			{/* Two-Factor Authentication Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						<CardTitle>Two-factor authentication</CardTitle>
					</div>
					<CardDescription>Add an extra layer of security to your account.</CardDescription>
				</CardHeader>
				<CardContent>
					{mfaEnabled ? (
						<div className="space-y-4">
							<div className="flex items-center gap-2 text-success">
								<ShieldCheck className="h-5 w-5" />
								<span className="text-sm font-medium">Two-factor authentication is enabled</span>
							</div>
							{mfaMethods.map((method) => (
								<div
									key={method.id}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div className="flex items-center gap-3">
										<Smartphone className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">{method.name}</p>
											<p className="text-xs text-muted-foreground">
												Added {method.createdAt} • Last used {method.lastUsed}
											</p>
										</div>
									</div>
									<Form method="post">
										<input type="hidden" name="intent" value="disable-mfa" />
										<input type="hidden" name="methodId" value={method.id} />
										<Button
											type="submit"
											variant="ghost"
											size="sm"
											className="text-destructive hover:bg-destructive/10"
										>
											Remove
										</Button>
									</Form>
								</div>
							))}
							<button
								type="button"
								onClick={() => setShowMfaSetup(true)}
								className="text-sm text-primary hover:underline"
							>
								Add another method
							</button>
						</div>
					) : (
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Two-factor authentication adds an additional layer of security to your account by
								requiring more than just a password to sign in.
							</p>
							<Button type="button" onClick={() => setShowMfaSetup(true)}>
								Enable Two-Factor Authentication
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* MFA Setup Modal */}
			{showMfaSetup && <MfaSetupModal onClose={() => setShowMfaSetup(false)} />}

			{/* Active Sessions Card */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0">
					<div>
						<div className="flex items-center gap-2">
							<KeyRound className="h-5 w-5" />
							<CardTitle>Active sessions</CardTitle>
						</div>
						<CardDescription>Manage your active sessions across devices.</CardDescription>
					</div>
					<Form method="post">
						<input type="hidden" name="intent" value="revoke-all-sessions" />
						<Button type="submit" variant="outline" size="sm">
							Sign out all other sessions
						</Button>
					</Form>
				</CardHeader>
				<CardContent className="p-0">
					<div className="divide-y">
						{sessions.map((session) => (
							<div key={session.id} className="flex items-center justify-between p-4">
								<div className="flex items-center gap-3">
									<div
										className={`h-2 w-2 rounded-full ${session.current ? "bg-success" : "bg-muted-foreground"}`}
									/>
									<div>
										<p className="text-sm font-medium">
											{session.device}
											{session.current && (
												<span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
													Current
												</span>
											)}
										</p>
										<p className="text-xs text-muted-foreground">
											{session.location} • {session.lastActive}
										</p>
									</div>
								</div>
								{!session.current && (
									<Form method="post">
										<input type="hidden" name="intent" value="revoke-session" />
										<input type="hidden" name="sessionId" value={session.id} />
										<Button
											type="submit"
											variant="ghost"
											size="icon"
											className="text-destructive hover:bg-destructive/10"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</Form>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Recent Security Activity Card */}
			<Card>
				<CardHeader>
					<CardTitle>Recent security activity</CardTitle>
					<CardDescription>Review recent security events on your account.</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					<div className="divide-y">
						{recentActivity.map((activity) => (
							<div key={activity.id} className="flex items-center justify-between p-4">
								<div>
									<p className="text-sm font-medium">{activity.action}</p>
									<p className="text-xs text-muted-foreground">
										{activity.device} • {activity.time}
									</p>
								</div>
								<span
									className={`rounded-full px-2 py-0.5 text-xs font-medium ${
										activity.success
											? "bg-success/10 text-success"
											: "bg-destructive/10 text-destructive"
									}`}
								>
									{activity.success ? "Success" : "Failed"}
								</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function MfaSetupModal({ onClose }: { onClose: () => void }) {
	const [step, setStep] = useState<"scan" | "verify">("scan");
	const [code, setCode] = useState("");

	const qrCodeUrl =
		"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/App:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=App";
	const backupCodes = ["ABCD-1234", "EFGH-5678", "IJKL-9012", "MNOP-3456"];

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<button
				type="button"
				className="absolute inset-0 bg-background/80 backdrop-blur-sm"
				onClick={onClose}
				aria-label="Close"
			/>
			<div className="relative z-10 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
				<h3 className="text-lg font-semibold">Set up Two-Factor Authentication</h3>

				{step === "scan" ? (
					<div className="mt-4 space-y-4">
						<p className="text-sm text-muted-foreground">
							Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
						</p>
						<div className="flex justify-center">
							<img src={qrCodeUrl} alt="QR Code" className="rounded-lg border" />
						</div>
						<div className="rounded-lg bg-muted p-3">
							<p className="text-xs text-muted-foreground">Can't scan? Enter this code manually:</p>
							<code className="mt-1 block font-mono text-sm">JBSWY3DPEHPK3PXP</code>
						</div>
						<Button type="button" className="w-full" onClick={() => setStep("verify")}>
							Continue
						</Button>
					</div>
				) : (
					<Form method="post" className="mt-4 space-y-4">
						<input type="hidden" name="intent" value="verify-mfa" />
						<p className="text-sm text-muted-foreground">
							Enter the 6-digit code from your authenticator app to verify setup.
						</p>
						<input
							type="text"
							name="code"
							value={code}
							onChange={(e) => setCode(e.target.value)}
							placeholder="000000"
							maxLength={6}
							className="w-full rounded-md border bg-background px-3 py-2 text-center font-mono text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
						/>
						<div className="rounded-lg border border-warning/50 bg-warning/10 p-3">
							<p className="text-sm font-medium text-warning">Save your backup codes</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Store these codes in a safe place. You can use them to access your account if you
								lose your authenticator.
							</p>
							<div className="mt-2 grid grid-cols-2 gap-2">
								{backupCodes.map((backupCode) => (
									<code key={backupCode} className="rounded bg-muted px-2 py-1 text-xs font-mono">
										{backupCode}
									</code>
								))}
							</div>
						</div>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								className="flex-1"
								onClick={() => setStep("scan")}
							>
								Back
							</Button>
							<Button type="submit" className="flex-1" disabled={code.length !== 6}>
								Verify & Enable
							</Button>
						</div>
					</Form>
				)}
			</div>
		</div>
	);
}

export const handle = {
	breadcrumb: "Security",
};
