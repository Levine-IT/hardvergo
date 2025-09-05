import { DraftListingImageStorage } from "../storage";

export class CreateUploadRequest {
	constructor(readonly storage: DraftListingImageStorage) {}
}
