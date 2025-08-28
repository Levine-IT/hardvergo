export const RESPONSIVE_BREAKPOINTS = [320, 480, 768, 1024, 1200, 1920];

export const SUPPORTED_FORMATS = ["webp", "avif", "jpeg"] as const;

export const IMAGE_EXTENSIONS = [
	"jpg",
	"jpeg",
	"png",
	"gif",
	"bmp",
	"tiff",
	"webp",
	"avif",
];

export const UPLOAD_TO_S3 = process.env.UPLOAD_TO_S3 === "true" || false;

export const S3_CONFIG = {
	region: process.env.AWS_REGION || "us-east-1",
	maxAttempts: 3,
	connectionTimeout: 5000,
	socketTimeout: 30000,
};

export const IMAGE_QUALITY = {
	webp: {
		quality: 85,
		effort: 4,
		nearLossless: false,
	},
	avif: {
		quality: 85,
		effort: 4,
		chromaSubsampling: "4:2:0" as const,
	},
	jpeg: {
		quality: 85,
		progressive: true,
		mozjpeg: true,
	},
};

export const RESIZE_OPTIONS = {
	fit: "cover" as const,
	position: "centre" as const,
};
