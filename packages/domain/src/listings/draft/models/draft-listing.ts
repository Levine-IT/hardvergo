import { DraftListingImageSource } from "./draft-listing-image-source";
import { DraftListingState } from "./draft-listing-state";

export class DraftListing {
	constructor(
		readonly state: DraftListingState,
		readonly draftImages: DraftListingImageSource[],
	) {}
}
