/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import type { Context } from "aws-lambda";
import winston from "winston";

export class Logger {
	private winston: winston.Logger;
	private context?: Context;

	constructor(context?: Context) {
		this.context = context;
		this.winston = winston.createLogger({
			level: process.env.LOG_LEVEL || "info",
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.errors({ stack: true }),
				winston.format.json(),
				winston.format.printf(({ timestamp, level, message, ...meta }) => {
					const contextInfo = this.context
						? {
								requestId: this.context.awsRequestId,
								functionName: this.context.functionName,
								remainingTime: this.context.getRemainingTimeInMillis?.(),
							}
						: {};

					return JSON.stringify({
						timestamp,
						level,
						message,
						context: contextInfo,
						...meta,
					});
				}),
			),
			transports: [new winston.transports.Console()],
		});
	}

	info(message: string, data?: any): void {
		this.winston.info(message, data);
	}

	error(message: string, data?: any): void {
		this.winston.error(message, data);
	}

	debug(message: string, data?: any): void {
		this.winston.debug(message, data);
	}

	warn(message: string, data?: any): void {
		this.winston.warn(message, data);
	}

	logLambdaStart(): void {
		if (!this.context) return;

		this.info("Lambda Handler Started", {
			functionVersion: this.context.functionVersion,
			memoryLimitMB: this.context.memoryLimitInMB,
		});
	}

	logLambdaEnd(processedCount: number, errorCount: number): void {
		this.info("Lambda Handler Completed", {
			processedCount,
			errorCount,
		});
	}

	logRecordStart(index: number, total: number, messageId: string): void {
		this.info("Processing SQS Record", {
			recordIndex: index + 1,
			totalRecords: total,
			messageId,
		});
	}

	logS3Event(
		eventName: string,
		bucketName: string,
		objectKey: string,
		objectSize?: number,
	): void {
		this.info("Processing S3 record", {
			eventName,
			bucketName,
			objectKey,
			objectSize,
		});
	}

	logOptimizationStart(bucketName: string, objectKey: string): void {
		this.info("Starting S3 image optimization", {
			s3Location: `s3://${bucketName}/${objectKey}`,
		});
	}

	logDownloadStart(bucketName: string, objectKey: string): void {
		this.info("Downloading image from S3", {
			s3Location: `s3://${bucketName}/${objectKey}`,
		});
	}

	logDownloadComplete(sizeKB: string, duration: number): void {
		this.info("Image downloaded successfully", {
			sizeKB,
			durationMs: duration,
		});
	}

	logImageMetadata(metadata: any, duration: number): void {
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

export function bytesToKB(bytes: number): string {
	return (bytes / 1024).toFixed(2);
}
