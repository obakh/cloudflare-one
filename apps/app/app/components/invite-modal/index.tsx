import { Button, Input } from "@repo/ui";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

type Role = "admin" | "member" | "viewer";

interface Invite {
	email: string;
	role: Role;
}

interface InviteModalProps {
	isOpen: boolean;
	onClose: () => void;
	onInvite: (invites: Invite[]) => Promise<void>;
}

const roles: { value: Role; label: string; description: string }[] = [
	{ value: "admin", label: "Admin", description: "Full access to all resources" },
	{ value: "member", label: "Member", description: "Can view and edit resources" },
	{ value: "viewer", label: "Viewer", description: "Read-only access" },
];

export function InviteModal({ isOpen, onClose, onInvite }: InviteModalProps) {
	const [invites, setInvites] = useState<Invite[]>([{ email: "", role: "member" }]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<number, string>>({});

	const addInvite = () => {
		setInvites([...invites, { email: "", role: "member" }]);
	};

	const removeInvite = (index: number) => {
		if (invites.length === 1) return;
		setInvites(invites.filter((_, i) => i !== index));
		const newErrors = { ...errors };
		delete newErrors[index];
		setErrors(newErrors);
	};

	const updateInvite = (index: number, field: keyof Invite, value: string) => {
		const newInvites = [...invites];
		newInvites[index] = { ...newInvites[index], [field]: value };
		setInvites(newInvites);

		// Clear error when user types
		if (errors[index]) {
			const newErrors = { ...errors };
			delete newErrors[index];
			setErrors(newErrors);
		}
	};

	const validateEmail = (email: string) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	};

	const handleSubmit = async () => {
		// Validate all emails
		const newErrors: Record<number, string> = {};
		const validInvites = invites.filter((invite, index) => {
			if (!invite.email.trim()) {
				return false; // Skip empty emails
			}
			if (!validateEmail(invite.email)) {
				newErrors[index] = "Invalid email address";
				return false;
			}
			return true;
		});

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		if (validInvites.length === 0) {
			setErrors({ 0: "Please enter at least one email" });
			return;
		}

		setIsSubmitting(true);
		try {
			await onInvite(validInvites);
			setInvites([{ email: "", role: "member" }]);
			onClose();
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<>
			<div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="w-full max-w-lg border bg-background p-6 shadow-lg">
					<div className="mb-4">
						<h2 className="text-lg font-semibold">Invite team members</h2>
						<p className="text-sm text-muted-foreground">Invite new members by email address.</p>
					</div>

					<div className="space-y-3">
						{invites.map((invite, index) => (
							<div key={index} className="flex items-start gap-2">
								<div className="flex-1">
									<Input
										type="email"
										value={invite.email}
										onChange={(e) => updateInvite(index, "email", e.target.value)}
										placeholder="email@example.com"
										className={cn(errors[index] && "border-destructive")}
									/>
									{errors[index] && (
										<p className="mt-1 text-xs text-destructive">{errors[index]}</p>
									)}
								</div>
								<select
									value={invite.role}
									onChange={(e) => updateInvite(index, "role", e.target.value)}
									className="h-10 border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
								>
									{roles.map((role) => (
										<option key={role.value} value={role.value}>
											{role.label}
										</option>
									))}
								</select>
								<button
									type="button"
									onClick={() => removeInvite(index)}
									disabled={invites.length === 1}
									className="flex h-10 w-10 items-center justify-center hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
								>
									<X className="h-4 w-4" />
								</button>
							</div>
						))}
					</div>

					<button
						type="button"
						onClick={addInvite}
						className="mt-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
					>
						<Plus className="h-4 w-4" />
						Add another
					</button>

					<div className="mt-6 flex justify-end gap-3">
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button onClick={handleSubmit} disabled={isSubmitting}>
							{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send invites"}
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
