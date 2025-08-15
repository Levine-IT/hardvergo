import {
	CopyObjectCommand,
	DeleteObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import {
	createPresignedPost,
	type PresignedPost,
} from "@aws-sdk/s3-presigned-post";
import { Inject, Injectable } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import type { ListingId } from "src/listings/model/listing-id";
import type { UserId } from "src/users/model/user-id";
import { v4 as uuidv4 } from "uuid";
import imageUploadConfig from "../config/image-upload.config";
import s3ConfigImport from "../config/s3.config";
import type { DraftImageUploadDto } from "./dto/darft-image-upload.dto";
import {
	DraftImage,
	type PersistantImage,
	type S3Image,
} from "./model/draft-image.model";

@Injectable()
export class ListingImageService {
	private static readonly extensionMap: Record<string, string> = {
		"image/jpeg": "jpg",
		"image/jpg": "jpg",
		"image/png": "png",
		"image/webp": "webp",
		"image/heic": "heic",
		"image/heif": "heif",
	};
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

	async createPresignedPost(
		userId: UserId,
		contentType: string,
	): Promise<DraftImageUploadDto> {
		const fileExtension =
			ListingImageService.extensionMap[contentType.toLowerCase()];
		if (!fileExtension) {
			throw new Error(`Unsupported content type: ${contentType}`);
		}

		const presignedPost = await this.draftImageToPresignedPost(
			new DraftImage(
				this.imageConfig.draftBucketName,
				userId,
				`${uuidv4()}.jpg`,
			),
		);

		return {
			expiresIn: this.imageConfig.presignedUrlExpirationSeconds,
			presignedPost: {
				url: presignedPost.url,
				fields: {
					bucket: presignedPost.fields.bucket,
					"X-Amz-Algorithm": presignedPost.fields["X-Amz-Algorithm"],
					"X-Amz-Credential": presignedPost.fields["X-Amz-Credential"],
					"X-Amz-Date": presignedPost.fields["X-Amz-Date"],
					key: presignedPost.fields.key,
					Policy: presignedPost.fields.Policy,
					"X-Amz-Signature": presignedPost.fields["X-Amz-Signature"],
				},
			},
		};
	}

	private async draftImageToPresignedPost(
		draftImage: DraftImage,
	): Promise<PresignedPost> {
		const presignedPost = await createPresignedPost(this.s3Client, {
			Bucket: draftImage.bucketName,
			Key: draftImage.getKey(),
			Conditions: [
				// CRITICAL: This enforces the 5MB limit at S3 level - upload will fail if exceeded
				["content-length-range", 1, this.imageConfig.maxFileSizeBytes],
				["eq", "$key", draftImage.getKey()], // Ensure exact key match
			],
			Expires: this.imageConfig.presignedUrlExpirationSeconds,
		});

		return presignedPost;
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
		listingId: ListingId,
	): Promise<PersistantImage> {
		const persistentImage = draftImage.toPersistantImage(
			this.imageConfig.persistentBucketName,
			listingId,
		);

		// Copy from draft to persistent location
		const copyCommand = new CopyObjectCommand({
			Bucket: persistentImage.bucketName,
			Key: persistentImage.getKey(),
			CopySource: draftImage.getPath(),
		});

		await this.s3Client.send(copyCommand);

		await this.deleteDraftImage(draftImage);

		return persistentImage;
	}

	getImageUrl(image: S3Image): string {
		return `${this.s3Config.endpoint}/${image.getPath()}`;
	}
}
