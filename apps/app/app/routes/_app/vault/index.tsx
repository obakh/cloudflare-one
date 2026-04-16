import {
	Download,
	File,
	FileImage,
	FileText,
	Film,
	Folder,
	Grid,
	List,
	MoreHorizontal,
	Search,
	Trash2,
	Upload,
} from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/index";

// import { getEnv } from "~/lib/env";
// import { createVaultStorage, type VaultFile } from "~/lib/storage.server";

interface VaultItem {
	id: string;
	name: string;
	type: "folder" | "file";
	mimeType?: string;
	size?: number;
	updatedAt: string;
	createdBy: string;
}

export async function loader({ context }: Route.LoaderArgs) {
	// Real implementation with @repo/storage:
	// const env = getEnv(context);
	// const vault = createVaultStorage(env);
	// const files = await vault.listFiles(teamId);
	// const items = files.map(f => ({
	//   id: f.id,
	//   name: f.name,
	//   type: "file" as const,
	//   mimeType: f.mimeType,
	//   size: f.size,
	//   updatedAt: f.updatedAt,
	//   createdBy: f.createdBy,
	// }));

	// Mock data for development
	return {
		items: [
			{
				id: "1",
				name: "Documents",
				type: "folder",
				updatedAt: "2024-06-10",
				createdBy: "John Doe",
			},
			{ id: "2", name: "Images", type: "folder", updatedAt: "2024-06-08", createdBy: "Jane Smith" },
			{
				id: "3",
				name: "Q2 Report.pdf",
				type: "file",
				mimeType: "application/pdf",
				size: 2456000,
				updatedAt: "2024-06-12",
				createdBy: "John Doe",
			},
			{
				id: "4",
				name: "Logo.png",
				type: "file",
				mimeType: "image/png",
				size: 156000,
				updatedAt: "2024-06-11",
				createdBy: "Jane Smith",
			},
			{
				id: "5",
				name: "Presentation.pptx",
				type: "file",
				mimeType: "application/vnd.ms-powerpoint",
				size: 5200000,
				updatedAt: "2024-06-09",
				createdBy: "Bob Wilson",
			},
			{
				id: "6",
				name: "Demo Video.mp4",
				type: "file",
				mimeType: "video/mp4",
				size: 45000000,
				updatedAt: "2024-06-07",
				createdBy: "John Doe",
			},
		] as VaultItem[],
		storage: {
			used: 52.4,
			total: 100,
		},
	};
}

export async function action({ request, context }: Route.ActionArgs) {
	const formData = await request.formData();
	const intent = formData.get("intent");

	// Real implementation:
	// const env = getEnv(context);
	// const vault = createVaultStorage(env);

	switch (intent) {
		case "upload": {
			// const fileName = formData.get("fileName") as string;
			// const mimeType = formData.get("mimeType") as string;
			// const { fileId, uploadUrl } = await vault.getUploadUrl(teamId, fileName, mimeType);
			// return { uploadUrl, fileId };
			return { success: true };
		}
		case "delete": {
			// const fileId = formData.get("fileId") as string;
			// await vault.deleteFile(fileId, teamId);
			return { success: true };
		}
		default:
			return { error: "Unknown action" };
	}
}

export default function Vault({ loaderData }: Route.ComponentProps) {
	const { items, storage } = loaderData;
	const [viewMode, setViewMode] = useState<"grid" | "list">("list");
	const [searchQuery, setSearchQuery] = useState("");

	const filteredItems = items.filter((item) =>
		item.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const folders = filteredItems.filter((item) => item.type === "folder");
	const files = filteredItems.filter((item) => item.type === "file");

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Vault</h1>
					<p className="text-muted-foreground">Securely store and manage your files.</p>
				</div>
				<button
					type="button"
					className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
				>
					<Upload className="h-4 w-4" />
					Upload
				</button>
			</div>

			{/* Storage Usage */}
			<div className="rounded-lg border bg-card p-4">
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Storage used</span>
					<span className="font-medium">
						{storage.used} GB / {storage.total} GB
					</span>
				</div>
				<div className="mt-2 h-2 rounded-full bg-muted">
					<div
						className="h-full rounded-full bg-primary"
						style={{ width: `${(storage.used / storage.total) * 100}%` }}
					/>
				</div>
			</div>

			{/* Toolbar */}
			<div className="flex items-center justify-between">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search files..."
						className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setViewMode("list")}
						className={cn("rounded-md p-2", viewMode === "list" ? "bg-accent" : "hover:bg-accent")}
					>
						<List className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={() => setViewMode("grid")}
						className={cn("rounded-md p-2", viewMode === "grid" ? "bg-accent" : "hover:bg-accent")}
					>
						<Grid className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Folders */}
			{folders.length > 0 && (
				<div>
					<h3 className="mb-3 text-sm font-medium text-muted-foreground">Folders</h3>
					<div
						className={cn(
							viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4" : "space-y-2",
						)}
					>
						{folders.map((folder) => (
							<FolderItem key={folder.id} item={folder} viewMode={viewMode} />
						))}
					</div>
				</div>
			)}

			{/* Files */}
			{files.length > 0 && (
				<div>
					<h3 className="mb-3 text-sm font-medium text-muted-foreground">Files</h3>
					{viewMode === "list" ? (
						<div className="rounded-lg border">
							<div className="grid grid-cols-12 gap-4 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
								<div className="col-span-6">Name</div>
								<div className="col-span-2">Size</div>
								<div className="col-span-2">Modified</div>
								<div className="col-span-2">Owner</div>
							</div>
							<div className="divide-y">
								{files.map((file) => (
									<FileListItem key={file.id} item={file} />
								))}
							</div>
						</div>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{files.map((file) => (
								<FileGridItem key={file.id} item={file} />
							))}
						</div>
					)}
				</div>
			)}

			{filteredItems.length === 0 && (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<File className="h-12 w-12 text-muted-foreground/50" />
					<p className="mt-4 text-sm font-medium">No files found</p>
					<p className="mt-1 text-sm text-muted-foreground">
						{searchQuery ? "Try a different search term" : "Upload files to get started"}
					</p>
				</div>
			)}
		</div>
	);
}

function FolderItem({ item, viewMode }: { item: VaultItem; viewMode: "grid" | "list" }) {
	if (viewMode === "grid") {
		return (
			<button
				type="button"
				className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 hover:bg-accent"
			>
				<Folder className="h-10 w-10 text-primary" />
				<span className="text-sm font-medium">{item.name}</span>
			</button>
		);
	}

	return (
		<button
			type="button"
			className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 hover:bg-accent w-full text-left"
		>
			<Folder className="h-5 w-5 text-primary" />
			<span className="flex-1 text-sm font-medium">{item.name}</span>
			<span className="text-xs text-muted-foreground">{item.updatedAt}</span>
		</button>
	);
}

function FileListItem({ item }: { item: VaultItem }) {
	const Icon = getFileIcon(item.mimeType);

	return (
		<div className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-accent group">
			<div className="col-span-6 flex items-center gap-3">
				<Icon className="h-5 w-5 text-muted-foreground" />
				<span className="text-sm truncate">{item.name}</span>
			</div>
			<div className="col-span-2 flex items-center text-sm text-muted-foreground">
				{formatFileSize(item.size || 0)}
			</div>
			<div className="col-span-2 flex items-center text-sm text-muted-foreground">
				{item.updatedAt}
			</div>
			<div className="col-span-2 flex items-center justify-between">
				<span className="text-sm text-muted-foreground truncate">{item.createdBy}</span>
				<div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
					<button type="button" className="rounded p-1 hover:bg-background" title="Download">
						<Download className="h-4 w-4" />
					</button>
					<button
						type="button"
						className="rounded p-1 hover:bg-background text-destructive"
						title="Delete"
					>
						<Trash2 className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
}

function FileGridItem({ item }: { item: VaultItem }) {
	const Icon = getFileIcon(item.mimeType);

	return (
		<div className="group rounded-lg border bg-card p-4 hover:bg-accent">
			<div className="flex items-start justify-between">
				<Icon className="h-8 w-8 text-muted-foreground" />
				<button
					type="button"
					className="rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-background"
				>
					<MoreHorizontal className="h-4 w-4" />
				</button>
			</div>
			<p className="mt-3 text-sm font-medium truncate">{item.name}</p>
			<p className="mt-1 text-xs text-muted-foreground">{formatFileSize(item.size || 0)}</p>
		</div>
	);
}

function getFileIcon(mimeType?: string) {
	if (!mimeType) return File;
	if (mimeType.startsWith("image/")) return FileImage;
	if (mimeType.startsWith("video/")) return Film;
	if (mimeType.includes("pdf") || mimeType.includes("document")) return FileText;
	return File;
}

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export const handle = {
	breadcrumb: "Vault",
};
