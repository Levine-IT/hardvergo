/**
 * S3 compatible pre-signed post request
 */
export class DraftListingImageUploadRequest {
	constructor(
		readonly url: string,
		readonly headers: DraftListingImageUploadRequestHeaders,
		readonly expirationSeconds: number,
	) {}
}

export class DraftListingImageUploadRequestHeaders {
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
