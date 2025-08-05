import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsString } from "class-validator";

export class CreateDraftImageUploadDto {
	@ApiProperty({
		description: "The MIME type of the image",
		example: "image/jpeg",
		enum: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
	})
	@IsString()
	@IsIn(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"])
	contentType: string;
}

export class DraftImageUploadDto {
	@ApiProperty({
		description: "Presigned URL for direct upload to S3",
		example:
			"https://mybucket.s3.amazonaws.com/temp/images/123e4567-e89b-12d3-a456-426614174000.jpg?X-Amz-Algorithm=...",
	})
	uploadUrl: string;

	@ApiProperty({
		description: "The temporary key/path where the image will be stored in S3",
		example: "temp/images/123e4567-e89b-12d3-a456-426614174000.jpg",
	})
	tempKey: string;

	@ApiProperty({
		description: "URL expiration time in seconds (300 = 5 minutes)",
		example: 300,
	})
	expiresIn: number;
}

export class DraftImageDeleteResponseDto {
	@ApiProperty({
		description: "Whether the temp image was successfully deleted",
		example: true,
	})
	deleted: boolean;

	@ApiProperty({
		description: "The temp key that was deleted",
		example: "temp/images/123e4567-e89b-12d3-a456-426614174000.jpg",
	})
	tempKey: string;
}
