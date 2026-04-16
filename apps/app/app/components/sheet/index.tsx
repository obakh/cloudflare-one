import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "~/lib/utils";

type SheetSide = "left" | "right" | "top" | "bottom";

interface SheetProps {
	isOpen: boolean;
	onClose: () => void;
	side?: SheetSide;
	title?: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
	width?: string;
}

const sideStyles: Record<SheetSide, string> = {
	left: "inset-y-0 left-0 border-r",
	right: "inset-y-0 right-0 border-l",
	top: "inset-x-0 top-0 border-b",
	bottom: "inset-x-0 bottom-0 border-t",
};

const sideAnimations: Record<SheetSide, { open: string; closed: string }> = {
	left: { open: "translate-x-0", closed: "-translate-x-full" },
	right: { open: "translate-x-0", closed: "translate-x-full" },
	top: { open: "translate-y-0", closed: "-translate-y-full" },
	bottom: { open: "translate-y-0", closed: "translate-y-full" },
};

export function Sheet({
	isOpen,
	onClose,
	side = "right",
	title,
	description,
	children,
	className,
	width = "w-96",
}: SheetProps) {
	// Handle escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const isHorizontal = side === "left" || side === "right";

	return (
		<>
			{/* Backdrop */}
			<button
				type="button"
				className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
				onClick={onClose}
				aria-label="Close sheet"
			/>

			{/* Sheet */}
			<div
				className={cn(
					"fixed z-50 bg-background shadow-lg transition-transform duration-300",
					sideStyles[side],
					isOpen ? sideAnimations[side].open : sideAnimations[side].closed,
					isHorizontal ? width : "h-96",
					className,
				)}
			>
				{/* Header */}
				{(title || description) && (
					<div className="flex items-start justify-between border-b p-4">
						<div>
							{title && <h2 className="text-lg font-semibold">{title}</h2>}
							{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
						</div>
						<button
							type="button"
							onClick={onClose}
							className="flex h-8 w-8 items-center justify-center hover:bg-accent"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				)}

				{/* Close button if no header */}
				{!title && !description && (
					<button
						type="button"
						onClick={onClose}
						className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center hover:bg-accent"
					>
						<X className="h-4 w-4" />
					</button>
				)}

				{/* Content */}
				<div className="h-full overflow-y-auto p-4">{children}</div>
			</div>
		</>
	);
}

// Sheet with form layout
interface SheetFormProps extends Omit<SheetProps, "children"> {
	children: React.ReactNode;
	footer?: React.ReactNode;
}

export function SheetForm({ children, footer, ...props }: SheetFormProps) {
	return (
		<Sheet {...props}>
			<div className="flex h-full flex-col">
				<div className="flex-1 overflow-y-auto">{children}</div>
				{footer && <div className="border-t p-4">{footer}</div>}
			</div>
		</Sheet>
	);
}

// Pre-configured detail sheet
interface DetailSheetProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	actions?: React.ReactNode;
}

export function DetailSheet({ isOpen, onClose, title, children, actions }: DetailSheetProps) {
	return (
		<Sheet isOpen={isOpen} onClose={onClose} title={title} width="w-[480px]">
			<div className="space-y-6">
				{children}
				{actions && <div className="flex gap-2 border-t pt-4">{actions}</div>}
			</div>
		</Sheet>
	);
}
