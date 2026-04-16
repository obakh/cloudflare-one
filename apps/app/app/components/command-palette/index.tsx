import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@repo/ui/command";
import { Icons } from "@repo/ui/icons";
import {
	Activity,
	ArrowDown,
	ArrowUp,
	CornerDownLeft,
	FileText,
	Home,
	LogOut,
	Settings,
	User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

interface CommandItemData {
	id: string;
	label: string;
	description?: string;
	icon: React.ComponentType<{ className?: string }>;
	action: () => void;
	keywords?: string[];
	group: string;
}

interface CommandPaletteProps {
	isOpen: boolean;
	onClose: () => void;
	onSignOut?: () => void;
}

// Helper function to format group names
const formatGroupName = (name: string): string => {
	switch (name) {
		case "navigation":
			return "Navigation";
		case "settings":
			return "Settings";
		case "account":
			return "Account";
		default:
			return name.charAt(0).toUpperCase() + name.slice(1);
	}
};

export function CommandPalette({ isOpen, onClose, onSignOut }: CommandPaletteProps) {
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const commands: CommandItemData[] = [
		{
			id: "dashboard",
			label: "Go to Dashboard",
			icon: Home,
			action: () => navigate("/"),
			keywords: ["home", "main"],
			group: "navigation",
		},
		{
			id: "activity",
			label: "Go to Activity",
			icon: Activity,
			action: () => navigate("/activity"),
			keywords: ["feed", "log"],
			group: "navigation",
		},
		{
			id: "vault",
			label: "Go to Vault",
			icon: FileText,
			action: () => navigate("/vault"),
			keywords: ["files", "documents"],
			group: "navigation",
		},
		{
			id: "settings",
			label: "Go to Settings",
			icon: Settings,
			action: () => navigate("/settings"),
			keywords: ["preferences", "config"],
			group: "settings",
		},
		{
			id: "profile",
			label: "Go to Profile",
			icon: User,
			action: () => navigate("/settings/profile"),
			keywords: ["account", "me"],
			group: "settings",
		},
		{
			id: "signout",
			label: "Sign out",
			icon: LogOut,
			action: () => onSignOut?.(),
			keywords: ["logout", "exit"],
			group: "account",
		},
	];

	const filteredCommands = query
		? commands.filter(
				(cmd) =>
					cmd.label.toLowerCase().includes(query.toLowerCase()) ||
					cmd.keywords?.some((k) => k.toLowerCase().includes(query.toLowerCase())),
			)
		: commands;

	// Group commands by their group property
	const groupedCommands = filteredCommands.reduce(
		(acc, cmd) => {
			if (!acc[cmd.group]) {
				acc[cmd.group] = [];
			}
			acc[cmd.group].push(cmd);
			return acc;
		},
		{} as Record<string, CommandItemData[]>,
	);

	const handleSelect = useCallback(
		(cmd: CommandItemData) => {
			cmd.action();
			onClose();
		},
		[onClose],
	);

	useEffect(() => {
		if (isOpen) {
			setQuery("");
			// Focus input when opened
			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		}
	}, [isOpen]);

	// Simulate loading state when searching
	useEffect(() => {
		if (query) {
			setIsLoading(true);
			const timer = setTimeout(() => setIsLoading(false), 150);
			return () => clearTimeout(timer);
		}
		setIsLoading(false);
	}, [query]);

	if (!isOpen) return null;

	return (
		<>
			<button
				type="button"
				className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm cursor-default"
				onClick={onClose}
				onKeyDown={(e) => e.key === "Escape" && onClose()}
				aria-label="Close command palette"
			/>
			<div className="fixed left-1/2 top-1/4 z-50 w-full max-w-[640px] -translate-x-1/2">
				<Command
					shouldFilter={false}
					className="overflow-hidden p-0 relative w-full bg-background backdrop-filter backdrop-blur-lg dark:bg-[#0C0C0C]/[99] h-auto border border-border"
					onKeyDown={(e: React.KeyboardEvent) => {
						if (e.key === "Escape") {
							onClose();
						}
					}}
				>
					{/* Search Input */}
					<div className="border-b border-border relative">
						<CommandInput
							ref={inputRef}
							placeholder="Type a command or search..."
							value={query}
							onValueChange={setQuery}
							className="px-4 h-[55px] py-0"
						/>
						{/* Loading indicator */}
						{isLoading && (
							<div className="absolute bottom-0 h-[2px] w-full overflow-hidden">
								<div className="absolute top-[1px] h-full w-40 animate-slide-effect bg-gradient-to-r dark:from-gray-800 dark:via-white dark:via-80% dark:to-gray-800 from-gray-200 via-black via-80% to-gray-200" />
							</div>
						)}
					</div>

					{/* Commands List */}
					<div className="px-2">
						<CommandList className="scrollbar-hide max-h-[350px]">
							{filteredCommands.length === 0 && query && (
								<CommandEmpty>No results found for "{query}".</CommandEmpty>
							)}
							{Object.entries(groupedCommands).map(([groupName, items]) => (
								<CommandGroup key={groupName} heading={formatGroupName(groupName)}>
									{items.map((cmd) => (
										<CommandItem
											key={cmd.id}
											value={cmd.id}
											onSelect={() => handleSelect(cmd)}
											className="text-sm flex items-center gap-2 py-2 group/item"
										>
											<Icons.Shortcut className="size-4 dark:text-[#666] text-primary" />
											<span>{cmd.label}</span>
										</CommandItem>
									))}
								</CommandGroup>
							))}
						</CommandList>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-end border-t border-border px-3 py-2 text-xs text-muted-foreground gap-2">
						<span className="flex items-center gap-1">
							<ArrowUp className="size-3" />
							<ArrowDown className="size-3" />
						</span>
						<span className="flex items-center">
							<CornerDownLeft className="size-3" />
						</span>
					</div>
				</Command>
			</div>
		</>
	);
}

// Hook to open command palette with keyboard shortcut
export function useCommandPalette() {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setIsOpen((prev) => !prev);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	return { isOpen, setIsOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
}
