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
import { DraftImage, PersistantImage, S3Image } from "./model/draft-image.model";
import { UserId } from "src/users/model/user-id";
import { ListingId } from "src/listings/model/listing-id";

@Injectable()
export class ListingImageService {
	private readonly s3Client: S3Client;

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
		draftImage: DraftImage
	): Promise<{ expires: number; presignedPost: object }> {
		const presignedPost = await createPresignedPost(this.s3Client, {
			Bucket: this.imageConfig.draftBucketName,
			Key: draftImage.getKey(),
			Conditions: [
				// CRITICAL: This enforces the 5MB limit at S3 level - upload will fail if exceeded
				["content-length-range", 1, this.imageConfig.maxFileSizeBytes],
				// ["starts-with", "$Content-Type", contentType.split("/")[0]], // Enforce file type
				["eq", "$key", draftImage.getKey()], // Ensure exact key match
			],
			Expires: this.imageConfig.presignedUrlExpirationSeconds,
		});

		return {
			expires: this.imageConfig.presignedUrlExpirationSeconds,
			presignedPost,
		};
	}

	async deleteDraftImage(draftImage: DraftImage): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: this.imageConfig.draftBucketName,
			Key: draftImage.getKey(),
		});

		await this.s3Client.send(command);
	}

	async moveTempToPersistent(
		draftImage: DraftImage,
		listingId: ListingId
	): Promise<PersistantImage> {
		const persistentImage = draftImage.toPersistantImage(this.imageConfig.persistentBucketName, listingId);

		// Copy from draft to persistent location
		const copyCommand = new CopyObjectCommand({
			Bucket: persistentImage.bucketName,
			Key: persistentImage.getKey(),
			CopySource: draftImage.getPath()
		});

		await this.s3Client.send(copyCommand);

		await this.deleteDraftImage(draftImage);

		return persistentImage;
	}

	getImageUrl(image: S3Image): string {
		return `${this.s3Config.endpoint}/${image.getPath()}`;
	}
}
