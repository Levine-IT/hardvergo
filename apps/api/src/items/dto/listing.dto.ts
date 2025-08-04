import { ApiProperty } from "@nestjs/swagger";

export class ImageVariantDto {
	@ApiProperty({ description: "Image URL for this variant" })
	url: string;

	@ApiProperty({ description: "Image width in pixels" })
	width: number;

	@ApiProperty({ description: "Image height in pixels" })
	height: number;

	@ApiProperty({ description: "File size in bytes" })
	fileSize: number;

	@ApiProperty({
		enum: ["webp", "jpeg", "png", "avif"],
		description: "Image format",
	})
	format: "webp" | "jpeg" | "png" | "avif";
}

export class MediaImageDataDto {
	@ApiProperty({ description: "Alt text for accessibility" })
	altText: string;

	@ApiProperty({
		type: [ImageVariantDto],
		description: "Different sizes and formats of the same image",
	})
	variants: ImageVariantDto[];
}

export class MediaVideoDataDto {
	@ApiProperty({ description: "Video URL" })
	url: string;

	@ApiProperty({ description: "Video duration in seconds", nullable: true })
	duration?: number;

	@ApiProperty({ description: "Video thumbnail URL" })
	thumbnailUrl: string;
}

export class MediaItemDto {
	@ApiProperty({ description: "Unique identifier for this media item" })
	id: string;

	@ApiProperty({ description: "Original filename" })
	filename: string;

	@ApiProperty({ enum: ["image", "video"], description: "Type of media" })
	type: "image" | "video";

	@ApiProperty({ description: "Order position in gallery (0-based)" })
	order: number;

	@ApiProperty({ description: "Upload timestamp" })
	uploadedAt: Date;

	@ApiProperty({
		type: MediaImageDataDto,
		description: "Image data (present when type is 'image')",
		nullable: true,
	})
	imageData?: MediaImageDataDto;

	@ApiProperty({
		type: MediaVideoDataDto,
		description: "Video data (present when type is 'video')",
		nullable: true,
	})
	videoData?: MediaVideoDataDto;
}

export class GalleryDto {
	@ApiProperty({
		type: [MediaItemDto],
		description: "All media items in the gallery, ordered by the 'order' field",
	})
	items: MediaItemDto[];

	@ApiProperty({
		description:
			"ID of the media item to use as cover (must exist in items array and be of type 'image')",
		nullable: true,
	})
	coverItemId?: string;
}

/**
 * Listing represents some used product that is advertised on the website as for saley
 */
export class ListingDto {
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

	@ApiProperty({ type: GalleryDto })
	gallery: GalleryDto;

	@ApiProperty({
		description:
			"Cities where personal trade is avaible. If null personal trade is not avaible for that item.",
		nullable: true,
	})
	locations?: string[];

	@ApiProperty({
		type: "object",
		additionalProperties: true,
		description:
			"Category-specific attributes like VRAM size, clock speed for GPUs, or other technical specifications",
		example: { vramSize: "8", clockSpeed: "1800", manufacturer: "NVIDIA" },
	})
	attributes: Record<string, any>;
}
