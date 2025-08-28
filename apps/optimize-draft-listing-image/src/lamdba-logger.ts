/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import type { Context, SQSEvent } from "aws-lambda";
import winston from "winston";
import { BaseLogger } from "./logger";

export function createWinstonLogger(context: Context): winston.Logger {
	return winston.createLogger({
		level: process.env.LOG_LEVEL || "debug",
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.errors({ stack: true }),
			winston.format.json(),
			winston.format.printf(({ timestamp, level, message, ...meta }) => {
				const contextInfo = context
					? {
							requestId: context.awsRequestId,
							functionName: context.functionName,
							remainingTime: context.getRemainingTimeInMillis?.(),
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

export class LamdbaLogger extends BaseLogger {
	private context: Context;

	constructor(context: Context) {
		super(createWinstonLogger(context));
		this.context = context;
	}

	logLambdaStart(uploadS3Flag: boolean, event: SQSEvent): void {
		this.info("Lambda Handler Started", {
			functionVersion: this.context.functionVersion,
			memoryLimitMB: this.context.memoryLimitInMB,
		});
		this.info("Upload to S3 flag", { flag: uploadS3Flag });
		this.info("SQS Event Records Count", {
			count: event.Records.length,
		});
		this.debug("Processing SQS event", { event: event });
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
}

export function bytesToKB(bytes: number): string {
	return (bytes / 1024).toFixed(2);
}
