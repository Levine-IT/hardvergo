import {} from "@hardvergo/application";
import { DraftListingImageStorage } from "@hardvergo/application/listings/draft";
import {
	DraftListingImageUploadRequest,
	DraftListingImageUploadRequestFields,
} from "@hardvergo/domain/listings/draft";
import { UserId } from "@hardvergo/domain/user";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";

export class AwsS3DraftListingImageStorage implements DraftListingImageStorage {
	constructor(readonly s3Client: S3Client) {}
	async createUploadRequest(
		userId: UserId,
	): Promise<DraftListingImageUploadRequest> {
		// const draftImageSource = new DraftListingImageSource(
		// 	userId,
		// 	new DraftListingImageSourceId("randomuuid"),
		// );

		const presignedPost = await createPresignedPost(this.s3Client, {
			Bucket: "draftImageSource.bucketName",
			Key: "draftImage.getKey()",
			Conditions: [
				// This enforces the 5MB limit at S3 level - upload will fail if exceeded
				["content-length-range", 1, 5_000_000], //this.imageConfig.maxFileSizeBytes],
				["eq", "$key", "draftImage.getKey()"], // Ensure exact key match
			],
			Fields: {
				"x-amz-expires": /*this.imageConfig.objectTtlDays **/ (
					1 *
					24 *
					60 *
					60
				).toString(),
			},
			Expires: 3, // this.imageConfig.presignedUrlExpirationSeconds,
		});

		const field = new DraftListingImageUploadRequestFields(
			presignedPost.fields["bucket"] ?? throwFieldError(""),
			presignedPost.fields["X-Amz-Algorithm"] ?? throwFieldError(""),
			presignedPost.fields["X-Amz-Credential"] ?? throwFieldError(""),
			presignedPost.fields["X-Amz-Date"] ?? throwFieldError(""),
			presignedPost.fields["key"] ?? throwFieldError(""),
			presignedPost.fields["Policy"] ?? throwFieldError(""),
			presignedPost.fields["X-Amz-Signature"] ?? throwFieldError(""),
		);
		return new DraftListingImageUploadRequest(
			presignedPost.url,
			field,
			3600,
			userId,
		);
	}
}

const throwFieldError = (field: string): never => {
	throw new Error(`Expected field was not found in presigned post: ${field}`);
};
