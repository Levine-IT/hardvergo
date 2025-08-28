import type { SQSRecord } from "aws-lambda";
import { EventParser } from "./event-parser";
import type { LamdbaLogger } from "./lamdba-logger";

// Mock the Logger
jest.mock("./logger");

const FAKE_SQS_ATTRIBUTES = {
	SenderId: "123456789012",
	SentTimestamp: "1693286400000",
	ApproximateReceiveCount: "1",
	ApproximateFirstReceiveTimestamp: "1693286401000",
};

describe("EventParser", () => {
	let eventParser: EventParser;
	let mockLogger: jest.Mocked<LamdbaLogger>;

	beforeEach(() => {
		mockLogger = {
			logRecordStart: jest.fn(),
			info: jest.fn(),
			debug: jest.fn(),
			error: jest.fn(),
		} as any;
		eventParser = new EventParser(mockLogger);
	});

	describe("parseAndValidateSQSRecord", () => {
		it("should return null for S3 test events", () => {
			const sqsRecord: SQSRecord = {
				messageId: "8c1237ae-8ab7-49f4-a95d-92a41ded40b8",
				receiptHandle:
					"ZWI3Y2UyZjUtOWUwMC00Nzc1LWE0OTEtNzIxZmM3OGY0OGQ5IGFybjphd3M6c3FzOmV1LWNlbnRyYWwtMTowMDAwMDAwMDAwMDA6b3B0aW1pemUtZHJhZnQtaW1hZ2VzIDhjMTIzN2FlLThhYjctNDlmNC1hOTVkLTkyYTQxZGVkNDBiOCAxNzU2Mzg0NTE4LjY1NDU0MDM=",
				body: JSON.stringify({
					Service: "Amazon S3",
					Event: "s3:TestEvent",
					Time: "2025-08-28T12:35:12.874Z",
					Bucket: "draft-listing-images",
					RequestId: "c3b20ead-6d3f-42f9-93cb-fe757f6873cc",
					HostId: "eftixk72aD6Ap51TnqcoF8eFidJG9Z/2",
				}),
				attributes: {
					SenderId: "000000000000",
					SentTimestamp: "1756384512877",
					ApproximateReceiveCount: "2",
					ApproximateFirstReceiveTimestamp: "1756384516291",
				},
				messageAttributes: {},
				md5OfBody: "83771a938e8a886eea31b9051c1d05d9",
				eventSourceARN:
					"arn:aws:sqs:eu-central-1:000000000000:optimize-draft-images",
				eventSource: "aws:sqs",
				awsRegion: "eu-central-1",
			};

			const result = eventParser.parseAndValidateSQSRecord(sqsRecord, 0, 1);

			expect(result).toBeNull();
			expect(mockLogger.logRecordStart).toHaveBeenCalledWith(
				0,
				1,
				"8c1237ae-8ab7-49f4-a95d-92a41ded40b8",
			);
			expect(mockLogger.info).toHaveBeenCalledWith("Event Source", "aws:sqs");
			expect(mockLogger.info).toHaveBeenCalledWith(
				"Event Source ARN",
				"arn:aws:sqs:eu-central-1:000000000000:optimize-draft-images",
			);
			expect(mockLogger.info).toHaveBeenCalledWith(
				"🧪 Ignoring S3 test event gracefully",
			);
		});

		it("should parse valid S3 event successfully", () => {
			const s3Event = {
				Records: [
					{
						eventVersion: "2.1",
						eventSource: "aws:s3",
						awsRegion: "us-east-1",
						eventTime: "2025-08-28T12:35:12.000Z",
						eventName: "ObjectCreated:Put",
						userIdentity: {
							principalId: "AWS:AIDACKCEVSQ6C2EXAMPLE",
						},
						requestParameters: {
							sourceIPAddress: "127.0.0.1",
						},
						responseElements: {
							"x-amz-request-id": "C3D13FE58DE4C810",
							"x-amz-id-2":
								"FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpD",
						},
						s3: {
							s3SchemaVersion: "1.0",
							configurationId: "testConfigRule",
							bucket: {
								name: "draft-listing-images",
								ownerIdentity: {
									principalId: "A3NL1KOZZKExample",
								},
								arn: "arn:aws:s3:::draft-listing-images",
							},
							object: {
								key: "test-image.jpg",
								size: 1024,
								eTag: "d41d8cd98f00b204e9800998ecf8427e",
								sequencer: "0A1B2C3D4E5F678901",
							},
						},
					},
				],
			};

			const sqsRecord: SQSRecord = {
				messageId: "test-message-id",
				receiptHandle: "test-receipt-handle",
				body: JSON.stringify(s3Event),
				attributes: FAKE_SQS_ATTRIBUTES,
				messageAttributes: {},
				md5OfBody: "test-md5",
				eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:test-queue",
				eventSource: "aws:sqs",
				awsRegion: "us-east-1",
			};

			const result = eventParser.parseAndValidateSQSRecord(sqsRecord, 0, 1);

			expect(result).toEqual(s3Event);
			expect(mockLogger.info).toHaveBeenCalledWith(
				"Parsed S3 event successfully",
				{
					recordsCount: 1,
				},
			);
		});

		it("should return null for invalid S3 event structure", () => {
			const invalidEvent = {
				Service: "Amazon S3",
				Event: "s3:ObjectCreated:Put",
				// Missing Records array
			};

			const sqsRecord: SQSRecord = {
				messageId: "test-message-id",
				receiptHandle: "test-receipt-handle",
				body: JSON.stringify(invalidEvent),
				attributes: FAKE_SQS_ATTRIBUTES,
				messageAttributes: {},
				md5OfBody: "test-md5",
				eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:test-queue",
				eventSource: "aws:sqs",
				awsRegion: "us-east-1",
			};

			const result = eventParser.parseAndValidateSQSRecord(sqsRecord, 0, 1);

			expect(result).toBeNull();
			expect(mockLogger.info).toHaveBeenCalledWith(
				"⚠️ Skipping message - not a valid S3Event structure",
			);
		});

		it("should throw error for malformed JSON", () => {
			const sqsRecord: SQSRecord = {
				messageId: "test-message-id",
				receiptHandle: "test-receipt-handle",
				body: "invalid json",
				attributes: FAKE_SQS_ATTRIBUTES,
				messageAttributes: {},
				md5OfBody: "test-md5",
				eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:test-queue",
				eventSource: "aws:sqs",
				awsRegion: "us-east-1",
			};

			expect(() => {
				eventParser.parseAndValidateSQSRecord(sqsRecord, 0, 1);
			}).toThrow();

			expect(mockLogger.error).toHaveBeenCalledWith(
				"Failed to parse SQS record body",
				{
					messageId: "test-message-id",
					error: expect.stringContaining("Unexpected token"),
				},
			);
		});
	});
});
