import { UserId } from "@hardvergo/domain/user";
import { DraftListingImageSource } from "@hardvergo/domain/listings/draft";

export interface DraftListingImageRepository {
	listSourceImages(userId: UserId): Promise<DraftListingImageSource[]>;
}
