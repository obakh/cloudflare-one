import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { ArrowRight, FileSpreadsheet, FileText, Upload } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/import";

const importSources = [
	{
		id: "csv",
		name: "CSV File",
		description: "Import data from a CSV spreadsheet",
		icon: FileSpreadsheet,
		available: true,
	},
	{
		id: "json",
		name: "JSON File",
		description: "Import data from a JSON file",
		icon: FileText,
		available: true,
	},
	{
		id: "notion",
		name: "Notion",
		description: "Import from Notion workspace",
		icon: () => (
			<svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
				<path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.22.186c-.094-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933zM2.64 1.782l13.168-.933c1.634-.14 2.055-.047 3.082.7l4.25 2.986c.7.513.933.653.933 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.995c0-.84.374-1.54 1.588-1.213z" />
			</svg>
		),
		available: false,
	},
	{
		id: "airtable",
		name: "Airtable",
		description: "Import from Airtable base",
		icon: () => (
			<svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
				<path d="M11.992 0L1.5 4.38v15.24l10.492 4.38 10.508-4.38V4.38L11.992 0zM3.18 6.099l8.812-3.681 8.82 3.681-8.82 3.681L3.18 6.1zm9.624 16.14V11.4l8.016-3.348v10.836l-8.016 3.348z" />
			</svg>
		),
		available: false,
	},
];

export async function loader(_args: Route.LoaderArgs) {
	return {
		recentImports: [
			{
				id: "1",
				source: "csv",
				fileName: "users.csv",
				records: 150,
				status: "completed",
				createdAt: "2024-06-10",
			},
			{
				id: "2",
				source: "json",
				fileName: "data.json",
				records: 45,
				status: "completed",
				createdAt: "2024-06-08",
			},
		],
	};
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "upload") {
		const _file = formData.get("file") as File;
		const _source = formData.get("source") as string;

		return { success: true, records: 100 };
	}

	return { error: "Invalid action" };
}

export default function ImportSettings({ loaderData }: Route.ComponentProps) {
	const { recentImports } = loaderData;
	const [selectedSource, setSelectedSource] = useState<string | null>(null);
	const fetcher = useFetcher();

	return (
		<div className="space-y-6">
			{/* Import Sources Card */}
			<Card>
				<CardHeader>
					<CardTitle>Import data</CardTitle>
					<CardDescription>Import your data from external sources.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 sm:grid-cols-2">
						{importSources.map((source) => {
							const Icon = source.icon;
							return (
								<button
									key={source.id}
									type="button"
									onClick={() => source.available && setSelectedSource(source.id)}
									disabled={!source.available}
									className={`relative flex items-start gap-4 rounded-lg border p-4 text-left transition-colors ${
										source.available
											? "hover:bg-accent cursor-pointer"
											: "opacity-50 cursor-not-allowed"
									} ${selectedSource === source.id ? "border-primary ring-1 ring-primary" : ""}`}
								>
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
										<Icon className="h-5 w-5" />
									</div>
									<div className="flex-1">
										<h3 className="text-sm font-medium">{source.name}</h3>
										<p className="mt-1 text-sm text-muted-foreground">{source.description}</p>
									</div>
									{!source.available && (
										<span className="absolute right-4 top-4 rounded bg-muted px-2 py-0.5 text-xs">
											Coming soon
										</span>
									)}
									{source.available && <ArrowRight className="h-5 w-5 text-muted-foreground" />}
								</button>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Upload Form */}
			{selectedSource && (
				<Card>
					<CardHeader>
						<CardTitle>Upload {selectedSource === "csv" ? "CSV" : "JSON"} file</CardTitle>
						<CardDescription>
							Select a file to import. We'll preview the data before importing.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<fetcher.Form method="post" encType="multipart/form-data" className="space-y-4">
							<input type="hidden" name="intent" value="upload" />
							<input type="hidden" name="source" value={selectedSource} />

							<div className="flex items-center justify-center rounded-lg border-2 border-dashed p-8">
								<label className="flex cursor-pointer flex-col items-center gap-2">
									<Upload className="h-8 w-8 text-muted-foreground" />
									<span className="text-sm font-medium">Click to upload</span>
									<span className="text-xs text-muted-foreground">
										{selectedSource === "csv" ? "CSV files only" : "JSON files only"}
									</span>
									<input
										type="file"
										name="file"
										accept={selectedSource === "csv" ? ".csv" : ".json"}
										className="hidden"
									/>
								</label>
							</div>

							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									className="flex-1"
									onClick={() => setSelectedSource(null)}
								>
									Cancel
								</Button>
								<Button type="submit" className="flex-1" disabled={fetcher.state === "submitting"}>
									{fetcher.state === "submitting" ? "Importing..." : "Import"}
								</Button>
							</div>
						</fetcher.Form>
					</CardContent>
				</Card>
			)}

			{/* Recent Imports Card */}
			{recentImports.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Recent imports</CardTitle>
						<CardDescription>Your recent import history.</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<div className="divide-y">
							{recentImports.map((importItem) => (
								<div key={importItem.id} className="flex items-center justify-between p-4">
									<div className="flex items-center gap-3">
										<FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">{importItem.fileName}</p>
											<p className="text-xs text-muted-foreground">
												{importItem.records} records • {importItem.createdAt}
											</p>
										</div>
									</div>
									<span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success capitalize">
										{importItem.status}
									</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

export const handle = {
	breadcrumb: "Import",
};
