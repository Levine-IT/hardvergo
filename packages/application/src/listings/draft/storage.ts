import { UserId } from "@hardvergo/domain/user";
import { DraftListingImageUploadRequest } from "@hardvergo/domain/listings/draft";

export interface DraftListingImageStorage {
	createUploadRequest(id: UserId): Promise<DraftListingImageUploadRequest>;
}
