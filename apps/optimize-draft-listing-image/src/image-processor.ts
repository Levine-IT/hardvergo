import sharp from "sharp";
import {
	IMAGE_QUALITY,
	RESIZE_OPTIONS,
	RESPONSIVE_BREAKPOINTS,
	SUPPORTED_FORMATS,
	UPLOAD_TO_S3,
} from "./constants";
import type { DatabaseRecorder } from "./database-recorder";
import type { Logger } from "./logger";
import { bytesToKB } from "./logger";
import type { S3Service } from "./s3-client";
import type {
	ImageDimensions,
	ImageMetadata,
	ResponsiveSize,
	S3ImageOptimizationMessage,
} from "./types";

export class ImageProcessor {
	private logger: Logger;
	private s3Service: S3Service;
	private databaseRecorder?: DatabaseRecorder;

	constructor(
		logger: Logger,
		s3Service: S3Service,
		databaseRecorder?: DatabaseRecorder,
	) {
		this.logger = logger;
		this.s3Service = s3Service;
		this.databaseRecorder = databaseRecorder;
	}

	async optimizeImage(message: S3ImageOptimizationMessage): Promise<void> {
		this.logger.logOptimizationStart(message.bucketName, message.objectKey);
		const optimizationStart = Date.now();

		try {
			const imageBuffer = await this.s3Service.downloadImage(
				message.bucketName,
				message.objectKey,
			);

			const metadata = await this.analyzeImageMetadata(imageBuffer);
			const responsiveSizes = this.generateResponsiveSizes(
				metadata.aspectRatio,
			);

			this.logger.logResponsiveSizes(responsiveSizes);

			const totalVariants =
				responsiveSizes.length * message.requestedFormats.length;
			this.logger.logProcessingStart(totalVariants);

			const processingStart = Date.now();
			await this.processImageVariants(imageBuffer, responsiveSizes, message);
			const processingDuration = Date.now() - processingStart;

			const totalDuration = Date.now() - optimizationStart;
			this.logger.logProcessingComplete();
			this.logger.logTimingBreakdown({
				download: 0, // Already logged in S3Service
				metadata: 0, // Already logged in analyzeImageMetadata
				processing: processingDuration,
				total: totalDuration,
			});
		} catch (error) {
			const totalDuration = Date.now() - optimizationStart;
			this.logger.error(
				`Error optimizing S3 image (after ${totalDuration}ms)`,
				{
					bucketName: message.bucketName,
					objectKey: message.objectKey,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			throw error;
		}
	}

	private async analyzeImageMetadata(
		imageBuffer: Buffer,
	): Promise<ImageMetadata> {
		this.logger.info("🔍 Analyzing image metadata...");
		const metadataStart = Date.now();

		const metadata = await sharp(imageBuffer).metadata();
		const originalWidth = metadata.width!;
		const originalHeight = metadata.height!;
		const aspectRatio = originalWidth / originalHeight;
		const metadataDuration = Date.now() - metadataStart;

		const imageMetadata: ImageMetadata = {
			format: metadata.format,
			width: originalWidth,
			height: originalHeight,
			aspectRatio: Number(aspectRatio.toFixed(2)),
			channels: metadata.channels,
			density: metadata.density,
			hasAlpha: metadata.hasAlpha,
			space: metadata.space,
		};

		this.logger.logImageMetadata(imageMetadata, metadataDuration);
		return imageMetadata;
	}

	private generateResponsiveSizes(aspectRatio: number): ResponsiveSize[] {
		return RESPONSIVE_BREAKPOINTS.map((width) => ({
			name: `w${width}`,
			width,
			height: Math.round(width / aspectRatio),
		}));
	}

	private async processImageVariants(
		originalBuffer: Buffer,
		responsiveSizes: ResponsiveSize[],
		message: S3ImageOptimizationMessage,
	): Promise<void> {
		const baseSharp = sharp(originalBuffer);

		try {
			const uploadTasks: Promise<void>[] = [];

			for (const format of message.requestedFormats) {
				for (const size of responsiveSizes) {
					const uploadTask = this.processImageVariant(
						baseSharp.clone(),
						size,
						format,
						message,
					);
					uploadTasks.push(uploadTask);
				}
			}

			this.logger.info(`📤 Starting ${uploadTasks.length} parallel uploads`);
			await Promise.all(uploadTasks);
		} finally {
			baseSharp.destroy();

			if (global.gc) {
				global.gc();
			}
		}
	}

	private async processImageVariant(
		sharpInstance: sharp.Sharp,
		size: ResponsiveSize,
		format: string,
		message: S3ImageOptimizationMessage,
	): Promise<void> {
		const variantStart = Date.now();
		this.logger.logVariantProcessing(
			format,
			size.name,
			size.width,
			size.height,
		);

		try {
			const processingStart = Date.now();
			const { buffer, contentType, fileExtension } =
				await this.processImageFormat(
					sharpInstance,
					{ width: size.width, height: size.height },
					format,
				);
			const processingDuration = Date.now() - processingStart;

			this.logger.logVariantComplete(
				format,
				size.name,
				bytesToKB(buffer.length),
				processingDuration,
			);

			const optimizedKey = this.s3Service.generateOptimizedKey(
				message.objectKey,
				size.name,
				fileExtension,
			);

			await this.uploadOrSkipVariant(
				buffer,
				optimizedKey,
				contentType,
				format,
				size,
				message,
				variantStart,
			);

			if (this.databaseRecorder) {
				await this.databaseRecorder.recordOptimizedImageVariant(
					message.objectKey,
					optimizedKey,
					size.width,
					size.height,
					buffer.length,
					format,
				);
			}
		} catch (error) {
			const totalVariantDuration = Date.now() - variantStart;
			this.logger.error(
				`Error processing ${format} variant for ${size.name} (after ${totalVariantDuration}ms)`,
				{
					error: error instanceof Error ? error.message : String(error),
					dimensions: { width: size.width, height: size.height },
					format,
					sizeName: size.name,
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			throw error;
		} finally {
			sharpInstance.destroy();
		}
	}

	private async processImageFormat(
		sharpInstance: sharp.Sharp,
		dimensions: ImageDimensions,
		format: string,
	): Promise<{ buffer: Buffer; contentType: string; fileExtension: string }> {
		const resizedSharp = sharpInstance.resize(
			dimensions.width,
			dimensions.height,
			RESIZE_OPTIONS,
		);

		switch (format) {
			case "webp":
				return {
					buffer: await resizedSharp.webp(IMAGE_QUALITY.webp).toBuffer(),
					contentType: "image/webp",
					fileExtension: "webp",
				};
			case "avif":
				return {
					buffer: await resizedSharp.avif(IMAGE_QUALITY.avif).toBuffer(),
					contentType: "image/avif",
					fileExtension: "avif",
				};
			case "jpeg":
				return {
					buffer: await resizedSharp.jpeg(IMAGE_QUALITY.jpeg).toBuffer(),
					contentType: "image/jpeg",
					fileExtension: "jpg",
				};
			default:
				throw new Error(
					`Unsupported format: ${format}. Supported formats are: ${SUPPORTED_FORMATS.join(", ")}`,
				);
		}
	}

	private async uploadOrSkipVariant(
		buffer: Buffer,
		optimizedKey: string,
		contentType: string,
		format: string,
		size: ResponsiveSize,
		message: S3ImageOptimizationMessage,
		variantStart: number,
	): Promise<void> {
		if (UPLOAD_TO_S3) {
			this.logger.logUploadQueued(format, optimizedKey);

			const uploadDuration = await this.s3Service.uploadOptimizedImage(
				message.bucketName,
				optimizedKey,
				buffer,
				contentType,
				{
					originalBucket: message.bucketName,
					originalKey: message.objectKey,
					size: size.name,
					format: format,
					width: size.width.toString(),
					height: size.height.toString(),
				},
			);

			const totalVariantDuration = Date.now() - variantStart;
			this.logger.logUploadComplete(
				format,
				size.name,
				optimizedKey,
				uploadDuration,
				totalVariantDuration,
			);
		} else {
			this.logger.logUploadSkipped(
				format,
				optimizedKey,
				bytesToKB(buffer.length),
			);
		}
	}
}
