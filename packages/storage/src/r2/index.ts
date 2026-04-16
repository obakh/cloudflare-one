/**
 * Cloudflare R2 Storage Helpers
 *
 * Provides presigned URL generation and upload validation for R2.
 *
 * @see https://developers.cloudflare.com/r2/
 */

import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * R2 credentials for presigned URL generation
 */
export interface R2Credentials {
	accountId: string;
	accessKeyId: string;
	secretAccessKey: string;
}

/**
 * Options for presigned URL generation
 */
export interface PresignedUrlOptions {
	/** Bucket name */
	bucket: string;
	/** Object key (path) */
	key: string;
	/** Expiration time in seconds (default: 3600 = 1 hour, max: 604800 = 7 days) */
	expiresIn?: number;
	/** Content type for PUT operations */
	contentType?: string;
	/** Content length for PUT operations */
	contentLength?: number;
}

/**
 * Upload validation options
 */
export interface UploadValidationOptions {
	/** Maximum file size in bytes */
	maxSize?: number;
	/** Allowed MIME types */
	allowedTypes?: string[];
}

/**
 * Upload validation result
 */
export interface ValidationResult {
	valid: boolean;
	error?: string;
}

/**
 * Create an S3 client configured for R2
 *
 * @example
 * ```ts
 * const client = createR2Client({
 *   accountId: env.CF_ACCOUNT_ID,
 *   accessKeyId: env.R2_ACCESS_KEY_ID,
 *   secretAccessKey: env.R2_SECRET_ACCESS_KEY,
 * });
 * ```
 */
export function createR2Client(credentials: R2Credentials): S3Client {
	return new S3Client({
		region: "auto",
		endpoint: `https://${credentials.accountId}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: credentials.accessKeyId,
			secretAccessKey: credentials.secretAccessKey,
		},
	});
}

/**
 * Generate a presigned URL for uploading (PUT)
 *
 * @example
 * ```ts
 * const uploadUrl = await generateUploadUrl(client, {
 *   bucket: "my-bucket",
 *   key: "uploads/image.png",
 *   contentType: "image/png",
 *   expiresIn: 3600,
 * });
 *
 * // Client can now PUT directly to this URL
 * ```
 */
export async function generateUploadUrl(
	client: S3Client,
	options: PresignedUrlOptions,
): Promise<string> {
	const { bucket, key, expiresIn = 3600, contentType, contentLength } = options;

	const command = new PutObjectCommand({
		Bucket: bucket,
		Key: key,
		...(contentType && { ContentType: contentType }),
		...(contentLength && { ContentLength: contentLength }),
	});

	return getSignedUrl(client, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading (GET)
 *
 * @example
 * ```ts
 * const downloadUrl = await generateDownloadUrl(client, {
 *   bucket: "my-bucket",
 *   key: "uploads/image.png",
 *   expiresIn: 3600,
 * });
 * ```
 */
export async function generateDownloadUrl(
	client: S3Client,
	options: PresignedUrlOptions,
): Promise<string> {
	const { bucket, key, expiresIn = 3600 } = options;

	const command = new GetObjectCommand({
		Bucket: bucket,
		Key: key,
	});

	return getSignedUrl(client, command, { expiresIn });
}

/**
 * Generate a presigned URL for checking if object exists (HEAD)
 */
export async function generateHeadUrl(
	client: S3Client,
	options: PresignedUrlOptions,
): Promise<string> {
	const { bucket, key, expiresIn = 3600 } = options;

	const command = new HeadObjectCommand({
		Bucket: bucket,
		Key: key,
	});

	return getSignedUrl(client, command, { expiresIn });
}

/**
 * Generate a presigned URL for deleting (DELETE)
 */
export async function generateDeleteUrl(
	client: S3Client,
	options: PresignedUrlOptions,
): Promise<string> {
	const { bucket, key, expiresIn = 3600 } = options;

	const command = new DeleteObjectCommand({
		Bucket: bucket,
		Key: key,
	});

	return getSignedUrl(client, command, { expiresIn });
}

/**
 * Validate an upload before generating a presigned URL
 *
 * @example
 * ```ts
 * const validation = validateUpload(
 *   { size: file.size, type: file.type },
 *   { maxSize: 10 * 1024 * 1024, allowedTypes: ["image/png", "image/jpeg"] }
 * );
 *
 * if (!validation.valid) {
 *   return c.json({ error: validation.error }, 400);
 * }
 * ```
 */
export function validateUpload(
	file: { size: number; type?: string },
	options: UploadValidationOptions = {},
): ValidationResult {
	const { maxSize, allowedTypes } = options;

	if (maxSize && file.size > maxSize) {
		return {
			valid: false,
			error: `File size ${file.size} exceeds maximum ${maxSize} bytes`,
		};
	}

	if (allowedTypes && file.type && !allowedTypes.includes(file.type)) {
		return {
			valid: false,
			error: `File type ${file.type} not allowed. Allowed: ${allowedTypes.join(", ")}`,
		};
	}

	return { valid: true };
}

/**
 * Generate a unique object key with optional prefix
 *
 * @example
 * ```ts
 * const key = generateObjectKey("uploads", "image.png");
 * // "uploads/1704067200000-a1b2c3d4-image.png"
 * ```
 */
export function generateObjectKey(prefix: string, filename: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 10);
	const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
	return `${prefix}/${timestamp}-${random}-${sanitized}`;
}

/**
 * Common MIME type groups for validation
 */
export const MIME_TYPES = {
	images: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
	documents: [
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	],
	videos: ["video/mp4", "video/webm", "video/quicktime"],
	audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"],
} as const;

/**
 * Common file size limits
 */
export const SIZE_LIMITS = {
	/** 1 MB */
	small: 1 * 1024 * 1024,
	/** 10 MB */
	medium: 10 * 1024 * 1024,
	/** 100 MB */
	large: 100 * 1024 * 1024,
	/** 1 GB */
	xlarge: 1024 * 1024 * 1024,
} as const;
