import { UserId } from "@hardvergo/domain/user";
import { DraftListingImageSource } from "@hardvergo/domain/listings/draft";

export interface DraftListingImageRepository {
	getSourceImages(id: UserId): DraftListingImageSource;
}
