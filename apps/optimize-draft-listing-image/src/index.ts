import type { Context, SQSEvent, SQSHandler } from "aws-lambda";
import { UPLOAD_TO_S3 } from "./constants";
import { getDatabaseClient } from "./database";
import { DatabaseRecorder } from "./database-recorder";
import { EventParser } from "./event-parser";
import { ImageLogger } from "./image-logger";
import { ImageProcessor } from "./image-processor";
import { LamdbaLogger } from "./lamdba-logger";
import { S3Service } from "./s3-client";

// Initialize database client outside handler for better performance
const databaseClient = getDatabaseClient();

export const handler: SQSHandler = async (
	event: SQSEvent,
	context: Context,
): Promise<void> => {
	const logger = new LamdbaLogger(context);
	const s3Service = new S3Service(logger);
	const databaseRecorder = new DatabaseRecorder(logger, databaseClient);
	const eventParser = new EventParser(logger);

	logger.logLambdaStart(UPLOAD_TO_S3, event);

	let processedCount = 0;
	let errorCount = 0;

	for (let index = 0; index < event.Records.length; index++) {
		const record = event.Records[index];

		try {
			const s3Event = eventParser.parseAndValidateSQSRecord(
				record,
				index,
				event.Records.length,
			);

			if (!s3Event) {
				processedCount++;
				continue;
			}

			const optimizationMessages =
				eventParser.filterProcessableS3Records(s3Event);

			for (const message of optimizationMessages) {
				const startTime = Date.now();
				const imageLogger = new ImageLogger(logger, message);

				const imageProcessor = new ImageProcessor(
					imageLogger,
					s3Service,
					databaseRecorder,
				);

				await imageProcessor.optimizeImage(message);

				const duration = Date.now() - startTime;
				imageLogger.info(
					`✅ Successfully processed S3 object: ${message.objectKey} (${duration}ms)`,
				);
			}

			processedCount++;
		} catch (error) {
			errorCount++;
			logger.error(`Error processing SQS record ${index + 1}`, {
				messageId: record.messageId,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			throw error;
		}
	}

	logger.logLambdaEnd(processedCount, errorCount);
};
