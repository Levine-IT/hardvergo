import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsIn,
	IsObject,
	IsString,
	IsUrl,
	ValidateNested,
} from "class-validator";

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

export class S3PresignedPostFieldsDto {
	@ApiProperty({
		description: "S3 bucket name",
		example: "hardvergo",
	})
	@IsString()
	bucket: string;

	@ApiProperty({
		description: "AWS signature algorithm",
		example: "AWS4-HMAC-SHA256",
	})
	@IsString()
	"X-Amz-Algorithm": string;

	@ApiProperty({
		description:
			"AWS credential string containing access key, date, region, service and request type",
		example: "minioadmin/20250806/eu-central-1/s3/aws4_request",
	})
	@IsString()
	"X-Amz-Credential": string;

	@ApiProperty({
		description: "AWS request date in ISO format",
		example: "20250806T125158Z",
	})
	@IsString()
	"X-Amz-Date": string;

	@ApiProperty({
		description: "S3 object key/path where the file will be stored",
		example: "draft/images/35e5232c-de68-482f-acd4-0dfff20f15a7.jpg",
	})
	@IsString()
	key: string;

	@ApiProperty({
		description:
			"Base64 encoded policy document that specifies conditions for the upload",
		example:
			"eyJleHBpcmF0aW9uIjoiMjAyNS0wOC0wNlQxMzo1MTo1OFoiLCJjb25kaXRpb25zIjpbWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMSwxMDQ4NTc2XSxbInN0YXJ0cy13aXRoIiwiJENvbnRlbnQtVHlwZSIsImltYWdlIl0sWyJlcSIsIiRrZXkiLCJkcmFmdC9pbWFnZXMvMzVlNTIzMmMtZGU2OC00ODJmLWFjZDQtMGRmZmYyMGYxNWE3LmpwZyJdLHsiYnVja2V0IjoiaGFyZHZlcmdvIn0seyJYLUFtei1BbGdvcml0aG0iOiJBV1M0LUhNQUMtU0hBMjU2In0seyJYLUFtei1DcmVkZW50aWFsIjoibWluaW9hZG1pbi8yMDI1MDgwNi9ldS1jZW50cmFsLTEvczMvYXdzNF9yZXF1ZXN0In0seyJYLUFtei1EYXRlIjoiMjAyNTA4MDZUMTI1MTU4WiJ9LHsia2V5IjoiZHJhZnQvaW1hZ2VzLzM1ZTUyMzJjLWRlNjgtNDgyZi1hY2Q0LTBkZmZmMjBmMTVhNy5qcGcifV19",
	})
	@IsString()
	Policy: string;

	@ApiProperty({
		description: "AWS signature for authenticating the request",
		example: "850314aa8200b996cd3d42d141998358b21d810188e0caa4e0155b0666e67a84",
	})
	@IsString()
	"X-Amz-Signature": string;
}

export class S3PresignedPostDto {
	@ApiProperty({
		description: "The URL endpoint where the form should be submitted",
		example: "http://hardvergo.localhost:9000/",
	})
	@IsUrl()
	url: string;

	@ApiProperty({
		description: "Form fields required for the presigned POST request",
		type: S3PresignedPostFieldsDto,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => S3PresignedPostFieldsDto)
	fields: S3PresignedPostFieldsDto;
}

export class DraftImageUploadDto {
	@ApiProperty({
		description: "URL expiration time in seconds",
		example: 300,
	})
	expiresIn: number;

	@ApiProperty({
		description: "Presigned post object for direct upload",
		type: S3PresignedPostDto,
	})
	presignedPost: S3PresignedPostDto;
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
