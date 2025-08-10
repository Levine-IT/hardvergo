import { ApiProperty } from "@nestjs/swagger";

export class ImageVariantDto {
	@ApiProperty({
		description: "Image URL for this variant",
		example: "https://example.com/images/laptop_800x600.webp",
	})
	url: string;

	@ApiProperty({
		description: "Image width in pixels",
		example: 800,
	})
	width: number;

	@ApiProperty({
		description: "Image height in pixels",
		example: 600,
	})
	height: number;

	@ApiProperty({
		description: "File size in bytes",
		example: 45320,
	})
	fileSize: number;

	@ApiProperty({
		enum: ["webp", "jpeg", "png", "avif"],
		description: "Image format",
		example: "webp",
	})
	format: "webp" | "jpeg" | "png" | "avif";
}

export class MediaImageDataDto {
	@ApiProperty({
		description: "Alt text for accessibility",
		example: "Gaming laptop ASUS ROG Strix G15 front view",
	})
	altText: string;

	@ApiProperty({
		type: [ImageVariantDto],
		description: "Different sizes and formats of the same image",
	})
	variants: ImageVariantDto[];
}

export class MediaVideoDataDto {
	@ApiProperty({
		description: "Video URL",
		example: "https://example.com/videos/laptop-demo.mp4",
	})
	url: string;

	@ApiProperty({
		description: "Video duration in seconds",
		nullable: true,
		example: 120,
	})
	duration?: number;

	@ApiProperty({
		description: "Video thumbnail URL",
		example: "https://example.com/thumbnails/laptop-demo.jpg",
	})
	thumbnailUrl: string;
}

export class MediaItemDto {
	@ApiProperty({
		description: "Unique identifier for this media item",
		example: "media_abc123def456",
	})
	id: string;

	@ApiProperty({
		description: "Original filename",
		example: "laptop-front-view.jpg",
	})
	filename: string;

	@ApiProperty({
		enum: ["image", "video"],
		description: "Type of media",
		example: "image",
	})
	type: "image" | "video";

	@ApiProperty({
		description: "Order position in gallery (0-based)",
		example: 0,
	})
	order: number;

	@ApiProperty({
		description: "Upload timestamp",
		example: "2024-08-04T10:30:00Z",
	})
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
		example: "media_abc123def456",
	})
	coverItemId?: string;
}
