import { ApiProperty } from "@nestjs/swagger";

export class CreateItemDto {
	@ApiProperty()
	title: string;

	@ApiProperty()
	description: string;

	@ApiProperty({ description: "Meant in HUF" })
	price: number;

	@ApiProperty({ example: "mhvXdrZT4jP5T8vBxuvm75" })
	sellerId: string;

	@ApiProperty({ example: "mhvXdrZT4jP5T8vBxuvm75" })
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
