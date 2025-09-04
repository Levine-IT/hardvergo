import { ApiProperty } from "@nestjs/swagger";
import {
	ArrayNotEmpty,
	IsArray,
	IsJSON,
	IsString,
	IsUrl,
	MaxLength,
} from "class-validator";

export class DraftImageDto {
	@ApiProperty({
		description: "The URL of the original image",
		example: "https://example.com/images/draft_laptop.webp",
	})
	@IsUrl()
	sourceUrl: string;

	@ApiProperty({
		description: "URLs of the optimized images",
		example: [
			"https://example.com/images/draft_laptop_optimized.webp",
			"https://example.com/images/draft_laptop_optimized.avif",
		],
	})
	@IsArray()
	@ArrayNotEmpty()
	@IsUrl({}, { each: true })
	optimizedUrls: string[];
}

export class DraftListingDto {
	@ApiProperty({
		description: "ID of the user who owns the draft listing",
		example: "mhvXdrZT4jP5T8vBxuvm75",
	})
	@IsString()
	userId: string;

	@IsString()
	@IsJSON()
	@MaxLength(100000)
	@ApiProperty({
		type: "string",
		maxLength: 100000,
		description:
			"Serialized stateform for the draft listing, including everything like title, description, price, etc. Max 100KB.",
	})
	state: string;

	@ApiProperty({
		type: [DraftImageDto],
		description: "List of draft images associated with the listing",
	})
	images: DraftImageDto[];
}
