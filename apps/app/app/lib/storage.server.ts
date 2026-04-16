/**
 * Server-side storage utilities
 * Uses @repo/storage for R2 and KV operations
 */
import {
	createNamespacedKV,
	createR2Client,
	generateDownloadUrl,
	generateUploadUrl,
	getJson,
	putJson,
} from "@repo/storage";

export {
	createNamespacedKV,
	createR2Client,
	generateDownloadUrl,
	generateUploadUrl,
	getJson,
	putJson,
};

/**
 * Storage environment bindings
 */
export interface StorageEnv {
	// R2 bucket for file storage
	VAULT_BUCKET: R2Bucket;
	// KV for metadata
	KV: KVNamespace;
	// R2 credentials for presigned URLs
	CF_ACCOUNT_ID: string;
	R2_ACCESS_KEY_ID: string;
	R2_SECRET_ACCESS_KEY: string;
}

/**
 * Vault file metadata
 */
export interface VaultFile {
	id: string;
	name: string;
	mimeType: string;
	size: number;
	key: string; // R2 object key
	teamId: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Create vault storage client
 */
export function createVaultStorage(env: StorageEnv) {
	const r2 = createR2Client({
		accountId: env.CF_ACCOUNT_ID,
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_SECRET_ACCESS_KEY,
	});

	const fileKV = createNamespacedKV(env.KV, "vault:file:");
	const teamFilesKV = createNamespacedKV(env.KV, "vault:team:");

	return {
		/**
		 * Generate upload URL for a new file
		 */
		async getUploadUrl(teamId: string, fileName: string, mimeType: string) {
			const fileId = crypto.randomUUID();
			const key = `${teamId}/${fileId}/${fileName}`;

			const uploadUrl = await generateUploadUrl(r2, {
				bucket: "vault",
				key,
				contentType: mimeType,
				expiresIn: 3600, // 1 hour
			});

			return { fileId, key, uploadUrl };
		},

		/**
		 * Save file metadata after upload
		 */
		async saveFileMetadata(file: Omit<VaultFile, "createdAt" | "updatedAt">) {
			const now = new Date().toISOString();
			const fullFile: VaultFile = {
				...file,
				createdAt: now,
				updatedAt: now,
			};

			await fileKV.put(file.id, fullFile);

			// Add to team's file list
			const teamFiles = (await teamFilesKV.get<string[]>(file.teamId)) ?? [];
			teamFiles.push(file.id);
			await teamFilesKV.put(file.teamId, teamFiles);

			return fullFile;
		},

		/**
		 * Get file metadata
		 */
		async getFile(fileId: string) {
			return fileKV.get<VaultFile>(fileId);
		},

		/**
		 * List files for a team
		 */
		async listFiles(teamId: string) {
			const fileIds = (await teamFilesKV.get<string[]>(teamId)) ?? [];
			const files = await Promise.all(fileIds.map((id: string) => fileKV.get<VaultFile>(id)));
			return files.filter((f): f is VaultFile => f !== null);
		},

		/**
		 * Generate download URL for a file
		 */
		async getDownloadUrl(file: VaultFile) {
			return generateDownloadUrl(r2, {
				bucket: "vault",
				key: file.key,
				expiresIn: 3600,
			});
		},

		/**
		 * Delete a file
		 */
		async deleteFile(fileId: string, teamId: string) {
			const file = await fileKV.get<VaultFile>(fileId);
			if (!file) return false;

			// Delete from R2
			await env.VAULT_BUCKET.delete(file.key);

			// Delete metadata
			await fileKV.delete(fileId);

			// Remove from team's file list
			const teamFiles = (await teamFilesKV.get<string[]>(teamId)) ?? [];
			const updatedFiles = teamFiles.filter((id: string) => id !== fileId);
			await teamFilesKV.put(teamId, updatedFiles);

			return true;
		},
	};
}
