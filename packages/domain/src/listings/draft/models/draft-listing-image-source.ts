import { UserId } from "@/user";
import { DraftListingImageSourceId } from "./draft-listing-image-source.id";

/**
 * Originally uploaded image by the user. Can represent an already existing or a not yet existing image.
 */
export class DraftListingImageSource {
	constructor(
		readonly userId: UserId,
		readonly id: DraftListingImageSourceId,
	) {}
}
