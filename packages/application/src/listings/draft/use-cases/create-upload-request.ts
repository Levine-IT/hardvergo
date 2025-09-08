import { UseCase } from "@/use-case";
import { DraftListingImageStorage } from "../storage";
import { UserId } from "@hardvergo/domain/user";
import { DraftListingImageUploadRequest } from "@hardvergo/domain/listings/draft";

export class CreateUploadRequestInput {
	constructor(readonly userId: UserId) {}
}

export class CreateUploadRequest
	implements UseCase<CreateUploadRequestInput, DraftListingImageUploadRequest>
{
	constructor(readonly storage: DraftListingImageStorage) {}

	execute(
		input: CreateUploadRequestInput,
	): Promise<DraftListingImageUploadRequest> {
		return this.storage.createUploadRequest(input.userId);
	}
}
