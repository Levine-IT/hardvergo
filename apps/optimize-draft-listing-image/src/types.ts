export interface S3ImageOptimizationMessage {
	bucketName: string;
	objectKey: string;
	requestedFormats: string[];
}

export interface ResponsiveSize {
	name: string;
	width: number;
	height: number;
}

export interface ImageDimensions {
	width: number;
	height: number;
}

export interface ProcessingTimings {
	download: number;
	metadata: number;
	processing: number;
	total: number;
}

export interface ImageMetadata {
	format?: string;
	width: number;
	height: number;
	aspectRatio: number;
	channels?: number;
	density?: number;
	hasAlpha?: boolean;
	space?: string;
}
