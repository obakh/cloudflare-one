import { Button, Input } from "@repo/ui";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

interface DeleteDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	title: string;
	description: string;
	confirmText?: string;
	requireConfirmation?: boolean;
	confirmationWord?: string;
	warning?: string;
}

export function DeleteDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = "Delete",
	requireConfirmation = true,
	confirmationWord = "DELETE",
	warning,
}: DeleteDialogProps) {
	const [value, setValue] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	const canDelete = !requireConfirmation || value === confirmationWord;

	const handleConfirm = async () => {
		if (!canDelete) return;
		setIsDeleting(true);
		try {
			await onConfirm();
			onClose();
		} finally {
			setIsDeleting(false);
			setValue("");
		}
	};

	if (!isOpen) return null;

	return (
		<>
			<div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="w-full max-w-md border bg-background p-6 shadow-lg">
					<h2 className="text-lg font-semibold">{title}</h2>
					<p className="mt-2 text-sm text-muted-foreground">{description}</p>

					{warning && (
						<div className="mt-4 flex items-start gap-2 border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/30 dark:bg-amber-900/10">
							<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
							<p className="text-sm text-amber-700 dark:text-amber-300">{warning}</p>
						</div>
					)}

					{requireConfirmation && (
						<div className="mt-4">
							<label htmlFor="confirm-delete" className="text-sm">
								Type <span className="font-medium">{confirmationWord}</span> to confirm.
							</label>
							<Input
								id="confirm-delete"
								type="text"
								value={value}
								onChange={(e) => setValue(e.target.value)}
								className="mt-2"
								autoComplete="off"
							/>
						</div>
					)}

					<div className="mt-6 flex justify-end gap-3">
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleConfirm}
							disabled={!canDelete || isDeleting}
						>
							{isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmText}
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}

// Pre-configured delete account dialog
interface DeleteAccountDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
}

export function DeleteAccountDialog({ isOpen, onClose, onConfirm }: DeleteAccountDialogProps) {
	return (
		<DeleteDialog
			isOpen={isOpen}
			onClose={onClose}
			onConfirm={onConfirm}
			title="Delete account"
			description="This action cannot be undone. This will permanently delete your account and remove all your data from our servers."
			confirmText="Delete account"
		/>
	);
}

// Pre-configured delete team dialog
interface DeleteTeamDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	hasActiveSubscription?: boolean;
}

export function DeleteTeamDialog({
	isOpen,
	onClose,
	onConfirm,
	hasActiveSubscription,
}: DeleteTeamDialogProps) {
	return (
		<DeleteDialog
			isOpen={isOpen}
			onClose={onClose}
			onConfirm={onConfirm}
			title="Delete team"
			description="This action cannot be undone. This will permanently delete your team and remove all associated data from our servers."
			confirmText="Delete team"
			warning={
				hasActiveSubscription
					? "You have an active subscription. Cancel it first to avoid further charges."
					: undefined
			}
		/>
	);
}
