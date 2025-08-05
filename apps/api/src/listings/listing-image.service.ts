import {
	CopyObjectCommand,
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
			region: this.s3Config.region,
			credentials: this.s3Config.credentials,
		});
	}

	async generatePresignedUploadUrl(
		contentType: string,
	): Promise<{ url: string; key: string }> {
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
		const tempKey = `${this.s3Config.tempPrefix}${uuidv4()}.${fileExtension}`;

		const command = new PutObjectCommand({
			Bucket: this.s3Config.bucketName,
			Key: tempKey,
			ContentType: contentType,
			ContentLength: this.imageConfig.maxFileSizeBytes,
			Metadata: {
				signedUrlCreatedAt: new Date().toISOString(),
			},
		});

		const url = await getSignedUrl(this.s3Client, command, {
			expiresIn: this.imageConfig.presignedUrlExpirationSeconds,
		});
		return { url, key: tempKey };
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
		return `https://${this.s3Config.bucketName}.s3.${this.s3Config.region}.amazonaws.com/${key}`;
	}
}
