import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	Post,
} from "@nestjs/common";
import {
	ApiBody,
	ApiOkResponse,
	ApiOperation,
	ApiResponse,
} from "@nestjs/swagger";
import { ListingDto } from "src/listings/dto/listing.dto";
import {
	CreateDraftImageUploadDto,
	DraftImageDeleteResponseDto,
	DraftImageUploadDto,
} from "./dto/darft-image-upload.dto";
import { DraftListingDto } from "./dto/draft-listing.dto";
import { ListingImageService } from "./listing-image.service";

@Controller("users/:userId/listings")
export class UserListingsController {
	constructor(private readonly s3Service: ListingImageService) {}

	@Get()
	@ApiOperation({ summary: "Get all listings for user" })
	@ApiOkResponse({
		description: "List listings with pagination",
		type: [ListingDto],
	})
	findAll() {
		return {}; // Implement logic to fetch user listings
	}

	@Get("draft")
	@ApiOperation({
		summary: "Fetches the draft listing",
		description:
			"This endpoint retrieves the draft listing for the user. The draft listing is a serialized stateform that includes attributes like title, description, price, etc.",
	})
	@ApiOkResponse({
		type: DraftListingDto,
	})
	async getDraft() {
		return {};
	}

	@Post("draft/images/presigned-url")
	@ApiOperation({
		summary: "Generate upload URL for draft listing",
		description:
			"This endpoint generates a presigned URL that allows direct upload to S3 without going through the server. The client should use this URL to upload the image directly to S3.",
	})
	@ApiBody({
		type: CreateDraftImageUploadDto,
	})
	@ApiOkResponse({
		description: "Presigned URL generated successfully",
		type: DraftImageUploadDto,
	})
	@ApiResponse({
		status: HttpStatus.INSUFFICIENT_STORAGE,
		description: "Storage limit exceeded, too many images uploaded",
	})
	async generatePresignedUploadUrl(
		@Body() body: CreateDraftImageUploadDto,
	): Promise<DraftImageUploadDto> {
		const { url, key } = await this.s3Service.generatePresignedUploadUrl(
			body.contentType,
		);

		return {
			uploadUrl: url,
			tempKey: key,
			expiresIn: 300,
		};
	}

	@Delete("draft/images/:tempKey")
	@ApiOperation({ summary: "Delete draft image" })
	@ApiOkResponse({
		description: "Temporary image deleted successfully",
		type: DraftImageDeleteResponseDto,
	})
	async deleteTempImage(
		@Param("tempKey") tempKey: string,
	): Promise<DraftImageDeleteResponseDto> {
		// Decode the temp key since it comes from URL params
		const decodedTempKey = decodeURIComponent(tempKey);
		await this.s3Service.deleteTempImage(decodedTempKey);

		return {
			deleted: true,
			tempKey: decodedTempKey,
		};
	}
}
