import { ApiProperty } from "@nestjs/swagger";
import { IsJSON, IsString, MaxLength } from "class-validator";

export class DraftImageDto {
	@ApiProperty({
		description: "The URL of the original image",
		example: "https://example.com/images/draft_laptop.webp",
	})
	sourceUrl: string;

	@ApiProperty({
		description: "The URL of the optimized image",
		example: "https://example.com/images/draft_laptop_optimized.webp",
	})
	optimizedUrls: string[];
}

export class DraftListingDto {
	@ApiProperty({
		description: "ID of the user who owns the draft listing",
		example: "mhvXdrZT4jP5T8vBxuvm75",
	})
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
