import type { S3Event, SQSRecord } from "aws-lambda";
import { IMAGE_EXTENSIONS, SUPPORTED_FORMATS } from "./constants";
import type { LamdbaLogger } from "./lamdba-logger";
import type { S3ImageOptimizationMessage } from "./types";

export class EventParser {
	private logger: LamdbaLogger;

	constructor(logger: LamdbaLogger) {
		this.logger = logger;
	}

	/**
	 * Parses and validates an SQS record containing an S3 event message.
	 *
	 * @param record - The SQS record to parse
	 * @param index - Current record index (for logging)
	 * @param total - Total number of records being processed (for logging)
	 * @returns S3Event if valid and processable, null if should be skipped
	 * @throws Error if parsing fails or record is malformed
	 */
	parseAndValidateSQSRecord(
		record: SQSRecord,
		index: number,
		total: number,
	): S3Event | null {
		this.logger.logRecordStart(index, total, record.messageId);
		this.logger.info("Event Source", record.eventSource);
		this.logger.info("Event Source ARN", record.eventSourceARN);
		this.logger.debug("Raw Body", record.body);

		try {
			const messageBody: unknown = JSON.parse(record.body);

			if (this.isS3TestEvent(messageBody)) {
				this.logger.info("🧪 Ignoring S3 test event gracefully");
				return null;
			}

			if (!this.isValidS3Event(messageBody)) {
				this.logger.info(
					"⚠️ Skipping message - not a valid S3Event structure",
				);
				return null;
			}

			const s3Event: S3Event = messageBody as S3Event;
			this.logger.info("Parsed S3 event successfully", {
				recordsCount: s3Event.Records.length,
			});

			return s3Event;
		} catch (error) {
			this.logger.error("Failed to parse SQS record body", {
				messageId: record.messageId,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	filterProcessableS3Records(s3Event: S3Event): S3ImageOptimizationMessage[] {
		const optimizationMessages: S3ImageOptimizationMessage[] = [];

		for (const s3Record of s3Event.Records) {
			this.logger.logS3Event(
				s3Record.eventName,
				s3Record.s3.bucket.name,
				s3Record.s3.object.key,
				s3Record.s3.object.size,
			);

			if (!this.isObjectCreatedEvent(s3Record.eventName)) {
				this.logger.info(
					`Skipping non-ObjectCreated event: ${s3Record.eventName}`,
				);
				continue;
			}

			if (!this.isImageFile(s3Record.s3.object.key)) {
				this.logger.info(
					`Skipping non-image file: ${s3Record.s3.object.key}`,
				);
				continue;
			}

			optimizationMessages.push({
				bucketName: s3Record.s3.bucket.name,
				objectKey: s3Record.s3.object.key,
				requestedFormats: SUPPORTED_FORMATS.slice(),
			});
		}

		return optimizationMessages;
	}

	private isS3TestEvent(messageBody: unknown): boolean {
		return (
			typeof messageBody === "object" &&
			messageBody !== null &&
			"Service" in messageBody &&
			"Event" in messageBody &&
			(messageBody as { Service: unknown; Event: unknown }).Service ===
				"Amazon S3" &&
			(messageBody as { Service: unknown; Event: unknown }).Event ===
				"s3:TestEvent"
		);
	}

	private isValidS3Event(messageBody: unknown): boolean {
		return (
			typeof messageBody === "object" &&
			messageBody !== null &&
			"Records" in messageBody &&
			Array.isArray((messageBody as { Records: unknown }).Records)
		);
	}

	private isObjectCreatedEvent(eventName: string): boolean {
		return eventName.startsWith("ObjectCreated:");
	}

	private isImageFile(objectKey: string): boolean {
		const fileExtension = objectKey.split(".").pop()?.toLowerCase();
		return !!fileExtension && IMAGE_EXTENSIONS.includes(fileExtension);
	}
}
