import { registerAs } from "@nestjs/config";

export interface ImageUploadConfig {
	allowedMimeTypes: string[];
	maxFileSizeBytes: number;
	presignedUrlExpirationSeconds: number;
}

export default registerAs(
	"imageUpload",
	(): ImageUploadConfig => ({
		allowedMimeTypes: [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/webp",
			"image/heic",
			"image/heif",
		],
		maxFileSizeBytes: 5 * 1024 * 1024, // 5MB
		presignedUrlExpirationSeconds: 300, // 5 minutes
	}),
);
