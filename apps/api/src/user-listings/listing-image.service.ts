import {
	CopyObjectCommand,
	DeleteObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { Inject, Injectable } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";
import imageUploadConfig from "../config/image-upload.config";
import s3ConfigImport from "../config/s3.config";

@Injectable()
export class ListingImageService {
	private s3Client: S3Client;

	constructor(
		@Inject(imageUploadConfig.KEY)
		private readonly imageConfig: ConfigType<typeof imageUploadConfig>,
		@Inject(s3ConfigImport.KEY)
		private readonly s3Config: ConfigType<typeof s3ConfigImport>,
	) {
		this.s3Client = new S3Client({
			endpoint: this.s3Config.endpoint,
			region: this.s3Config.region,
			credentials: this.s3Config.credentials,
		});
	}

	async generatePresignedUploadUrl(
		contentType: string,
	): Promise<{ expires: number; presignedPost: object }> {
		// Validate content type using configuration
		if (
			!this.imageConfig.allowedMimeTypes.includes(contentType.toLowerCase())
		) {
			throw new Error(
				`Invalid content type. Only the following image types are allowed: ${this.imageConfig.allowedMimeTypes.join(", ")} got: ${contentType.toLowerCase()}`,
			);
		}

		// Determine file extension from content type
		const extensionMap: Record<string, string> = {
			"image/jpeg": "jpg",
			"image/jpg": "jpg",
			"image/png": "png",
			"image/webp": "webp",
			"image/heic": "heic",
			"image/heif": "heif",
		};

		const fileExtension = extensionMap[contentType.toLowerCase()];
		const tempKey = `${this.s3Config.draftPrefix}${uuidv4()}.${fileExtension}`;

		const presignedPost = await createPresignedPost(this.s3Client, {
			Bucket: this.s3Config.bucketName,
			Key: tempKey,
			Conditions: [
				// CRITICAL: This enforces the 5MB limit at S3 level - upload will fail if exceeded
				["content-length-range", 1, this.imageConfig.maxFileSizeBytes],
				// ["starts-with", "$Content-Type", contentType.split("/")[0]], // Enforce file type
				["eq", "$key", tempKey], // Ensure exact key match
			],
			Expires: this.imageConfig.presignedUrlExpirationSeconds,
		});

		return {
			expires: this.imageConfig.presignedUrlExpirationSeconds,
			presignedPost,
		};
	}

	async deleteTempImage(tempKey: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: this.s3Config.bucketName,
			Key: tempKey,
		});

		await this.s3Client.send(command);
	}

	async moveTempToPersistent(
		tempKey: string,
		listingId: string,
	): Promise<string> {
		const fileExtension = tempKey.split(".").pop();
		const persistentKey = `${this.s3Config.persistentPrefix}${listingId}/${uuidv4()}.${fileExtension}`;

		// Copy from temp to persistent location
		const copyCommand = new CopyObjectCommand({
			Bucket: this.s3Config.bucketName,
			Key: persistentKey,
			CopySource: `${this.s3Config.bucketName}/${tempKey}`,
		});

		await this.s3Client.send(copyCommand);

		// Delete temp image
		await this.deleteTempImage(tempKey);

		return persistentKey;
	}

	getImageUrl(key: string): string {
		// return `https://${this.s3Config.bucketName}.s3.${this.s3Config.region}.amazonaws.com/${key}`;
		return `${this.s3Config.endpoint}/${this.s3Config.bucketName}/${key}`;
	}
}
