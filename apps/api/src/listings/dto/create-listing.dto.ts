import { ApiProperty } from "@nestjs/swagger";

export class CreateListingDto {
	@ApiProperty({
		description: "Title of the listing",
		example: "Gaming Laptop ASUS ROG Strix G15",
	})
	title: string;

	@ApiProperty({
		description: "Detailed description of the item",
		example:
			"Excellent condition gaming laptop with RTX 3070, 16GB RAM, used for 6 months only.",
	})
	description: string;

	@ApiProperty({
		description: "Meant in HUF",
		example: 450000,
	})
	price: number;

	@ApiProperty({
		description: "ID of the user selling the item",
		example: "mhvXdrZT4jP5T8vBxuvm75",
	})
	sellerId: string;

	@ApiProperty({
		description: "ID of the category this item belongs to",
		example: "mhvXdrZT4jP5T8vBxuvm75",
	})
	categoryId: string;

	@ApiProperty({
		type: "object",
		additionalProperties: true,
		description:
			"Category-specific attributes like VRAM size, clock speed for GPUs, or other technical specifications",
		example: { vramSize: "8", clockSpeed: "1800", manufacturer: "NVIDIA" },
	})
	attributes?: Record<string, any>;
}
