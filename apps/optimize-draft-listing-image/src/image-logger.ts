import type { LamdbaLogger } from "./lamdba-logger";
import { BaseLogger } from "./logger";
import type { ImageMetadata, S3ImageOptimizationMessage } from "./types";

export class ImageLogger extends BaseLogger {
	constructor(logger: LamdbaLogger, message: S3ImageOptimizationMessage) {
		super(
			logger.child({
				bucketName: message.bucketName,
				objectKey: message.objectKey,
			}),
		);
	}

	logOptimizationStart(bucketName: string, objectKey: string): void {
		this.info("Starting S3 image optimization", {
			s3Location: `s3://${bucketName}/${objectKey}`,
		});
	}

	logImageMetadata(metadata: ImageMetadata, duration: number): void {
		this.info("Original image metadata analyzed", {
			...metadata,
			analysisDurationMs: duration,
		});
	}

	logResponsiveSizes(
		sizes: Array<{ name: string; width: number; height: number }>,
	): void {
		this.info("Generated responsive sizes", {
			sizes: sizes.map((s) => ({
				name: s.name,
				dimensions: `${s.width}x${s.height}`,
			})),
		});
	}

	logProcessingStart(totalVariants: number): void {
		this.info("Starting image variant optimization", {
			totalVariants,
			strategy: "serial compression with parallel uploads",
		});
	}

	logProcessingComplete(): void {
		this.info("All image variants processed successfully");
	}

	logTimingBreakdown(timings: {
		download: number;
		metadata: number;
		processing: number;
		total: number;
	}): void {
		this.info("Processing timing breakdown", {
			downloadMs: timings.download,
			metadataMs: timings.metadata,
			processingMs: timings.processing,
			totalMs: timings.total,
		});
	}

	logVariantProcessing(
		format: string,
		sizeName: string,
		width: number,
		height: number,
	): void {
		this.info("Processing image variant", {
			format,
			sizeName,
			dimensions: `${width}x${height}`,
		});
	}

	logVariantComplete(
		format: string,
		sizeName: string,
		sizeKB: string,
		duration: number,
	): void {
		this.info("Image variant processed", {
			format,
			sizeName,
			sizeKB,
			durationMs: duration,
		});
	}

	logUploadQueued(format: string, key: string): void {
		this.info("Upload queued", {
			format,
			s3Key: key,
		});
	}

	logUploadComplete(
		format: string,
		sizeName: string,
		key: string,
		uploadDuration: number,
		totalDuration: number,
	): void {
		this.info("Upload completed", {
			format,
			sizeName,
			s3Key: key,
			uploadDurationMs: uploadDuration,
			totalDurationMs: totalDuration,
		});
	}

	logUploadSkipped(format: string, key: string, sizeKB: string): void {
		this.info("Upload skipped - UPLOAD_TO_S3 disabled", {
			format,
			s3Key: key,
			sizeKB,
		});
	}
}
