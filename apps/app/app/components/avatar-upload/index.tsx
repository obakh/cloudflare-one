import { Loader2, User } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "~/lib/utils";

interface AvatarUploadProps {
	currentUrl?: string | null;
	size?: number;
	className?: string;
	onUpload?: (file: File) => Promise<string | undefined>;
}

export function AvatarUpload({ currentUrl, size = 64, className, onUpload }: AvatarUploadProps) {
	const [avatar, setAvatar] = useState(currentUrl);
	const [isLoading, setIsLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			alert("Please select an image file");
			return;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			alert("File size must be less than 5MB");
			return;
		}

		setIsLoading(true);
		try {
			const url = await onUpload?.(file);
			if (url) {
				setAvatar(url);
			} else {
				// Preview locally if no URL returned
				const reader = new FileReader();
				reader.onload = (event) => {
					setAvatar(event.target?.result as string);
				};
				reader.readAsDataURL(file);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			type="button"
			onClick={() => inputRef.current?.click()}
			className={cn(
				"relative flex items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-muted",
				className,
			)}
			style={{ width: size, height: size }}
		>
			{isLoading ? (
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			) : avatar ? (
				<img src={avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
			) : (
				<User className="h-6 w-6 text-muted-foreground" />
			)}

			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				onChange={handleUpload}
				className="hidden"
			/>

			{/* Hover overlay */}
			<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100">
				<span className="text-xs font-medium text-white">Change</span>
			</div>
		</button>
	);
}

// Logo upload variant
interface LogoUploadProps {
	currentUrl?: string | null;
	className?: string;
	onUpload?: (file: File) => Promise<string | undefined>;
}

export function LogoUpload({ currentUrl, className, onUpload }: LogoUploadProps) {
	const [logo, setLogo] = useState(currentUrl);
	const [isLoading, setIsLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			alert("Please select an image file");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			alert("File size must be less than 5MB");
			return;
		}

		setIsLoading(true);
		try {
			const url = await onUpload?.(file);
			if (url) {
				setLogo(url);
			} else {
				const reader = new FileReader();
				reader.onload = (event) => {
					setLogo(event.target?.result as string);
				};
				reader.readAsDataURL(file);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			type="button"
			onClick={() => inputRef.current?.click()}
			className={cn(
				"relative flex h-24 w-40 items-center justify-center border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-muted",
				className,
			)}
		>
			{isLoading ? (
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			) : logo ? (
				<img src={logo} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
			) : (
				<div className="text-center">
					<span className="text-xs text-muted-foreground">Upload logo</span>
				</div>
			)}

			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				onChange={handleUpload}
				className="hidden"
			/>
		</button>
	);
}
