import { DraftListingImageSourceId } from "./draft-listing-image-source.id";

/**
 * Originally uploaded image by the user
 */
export class DraftListingImageSource {
	constructor(readonly id: DraftListingImageSourceId) {}
}
