import { UserId } from "@/user";

/**
 * S3 compatible pre-signed post request
 */
export class DraftListingImageUploadRequest {
	constructor(
		readonly url: string,
		readonly fields: DraftListingImageUploadRequestFields,
		readonly expirationSeconds: number,
		readonly userId: UserId,
	) {}
}

export class DraftListingImageUploadRequestFields {
	constructor(
		readonly bucket: string,
		readonly xAmzAlgorithm: string,
		readonly xAmzCredential: string,
		readonly xAmzDate: string,
		readonly key: string,
		readonly policy: string,
		readonly xAmzSignature: string,
	) {}
}
