import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import type { Context, S3Event, SQSEvent, SQSHandler } from "aws-lambda";
import sharp from "sharp";
import { getDatabaseClient, isDatabaseEnabled } from "./database";

interface S3ImageOptimizationMessage {
	bucketName: string;
	objectKey: string;
	requestedFormats: string[];
}

export const handler: SQSHandler = async (
	event: SQSEvent,
	context: Context,
): Promise<void> => {
	console.log("=== Lambda Handler Started ===");
	console.log("AWS Request ID:", context.awsRequestId);
	console.log("Function Name:", context.functionName);
	console.log("Function Version:", context.functionVersion);
	console.log("Remaining Time (ms):", context.getRemainingTimeInMillis());
	console.log("Memory Limit (MB):", context.memoryLimitInMB);
	console.log("Upload to S3 flag:", UPLOAD_TO_S3);
	console.log("SQS Event Records Count:", event.Records.length);
	console.log("Processing SQS event:", JSON.stringify(event, null, 2));

	// Process records synchronously for better error handling
	let processedCount = 0;
	let errorCount = 0;

	for (let index = 0; index < event.Records.length; index++) {
		const record = event.Records[index];
		console.log(
			`\n--- Processing Record ${index + 1}/${event.Records.length} ---`,
		);
		console.log("Record ID:", record.messageId);
		console.log("Event Source:", record.eventSource);
		console.log("Event Source ARN:", record.eventSourceARN);
		console.log("Raw Body:", record.body);

		try {
			// Parse the SQS message body
			const messageBody = JSON.parse(record.body);

			// Check if this is a direct S3 test event (not wrapped in S3Event structure)
			if (
				messageBody.Service === "Amazon S3" &&
				messageBody.Event === "s3:TestEvent"
			) {
				console.log("🧪 Ignoring S3 test event gracefully");
				processedCount++;
				continue;
			}

			// Validate that this is a proper S3Event structure
			if (!messageBody.Records || !Array.isArray(messageBody.Records)) {
				console.log("⚠️ Skipping message - not a valid S3Event structure");
				processedCount++;
				continue;
			}

			// Parse as S3Event for normal S3 events
			const s3Event: S3Event = messageBody;
			console.log("Parsed S3 event successfully:", {
				recordsCount: s3Event.Records.length,
			});

			// Process each S3 record in the event
			for (const s3Record of s3Event.Records) {
				console.log("Processing S3 record:", {
					eventName: s3Record.eventName,
					bucketName: s3Record.s3.bucket.name,
					objectKey: s3Record.s3.object.key,
					objectSize: s3Record.s3.object.size,
				});

				// Only process ObjectCreated events
				if (!s3Record.eventName.startsWith("ObjectCreated:")) {
					console.log(
						`Skipping non-ObjectCreated event: ${s3Record.eventName}`,
					);
					continue;
				}

				// Skip non-image files based on file extension
				const objectKey = s3Record.s3.object.key;
				const fileExtension = objectKey.split(".").pop()?.toLowerCase();
				const imageExtensions = [
					"jpg",
					"jpeg",
					"png",
					"gif",
					"bmp",
					"tiff",
					"webp",
					"avif",
				];

				if (!fileExtension || !imageExtensions.includes(fileExtension)) {
					console.log(`Skipping non-image file: ${objectKey}`);
					continue;
				}

				const startTime = Date.now();
				await optimizeS3Image({
					bucketName: s3Record.s3.bucket.name,
					objectKey: objectKey,
					requestedFormats: SUPPORTED_FORMATS.slice(), // Use all supported formats by default
				});
				const duration = Date.now() - startTime;

				console.log(
					`✅ Successfully processed S3 object: ${objectKey} (${duration}ms)`,
				);
			}

			processedCount++;
		} catch (error) {
			errorCount++;
			console.error(`❌ Error processing SQS record ${index + 1}:`, {
				messageId: record.messageId,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			// If any record failed, throw error to trigger DLQ behavior
			throw error;
		}
	}

	console.log("\n=== Lambda Handler Completed ===");
	console.log(`Processed: ${processedCount}, Errors: ${errorCount}`);
	console.log("Remaining Time (ms):", context.getRemainingTimeInMillis());
};

const RESPONSIVE_BREAKPOINTS = [320, 480, 768, 1024, 1200, 1920];

const SUPPORTED_FORMATS = ["webp", "avif", "jpeg"] as const;

const UPLOAD_TO_S3 = process.env.UPLOAD_TO_S3 === "true" || false;

// Helper function to convert bytes to kilobytes
function bytesToKB(bytes: number): string {
	return (bytes / 1024).toFixed(2);
}

const s3Client = new S3Client({
	region: process.env.AWS_REGION || "us-east-1",
	maxAttempts: 3,
	requestHandler: {
		connectionTimeout: 5000,
		socketTimeout: 30000,
	},
});

async function optimizeS3Image(
	message: S3ImageOptimizationMessage,
): Promise<void> {
	console.log(
		"🔄 Starting S3 image optimization for:",
		`s3://${message.bucketName}/${message.objectKey}`,
	);
	const optimizationStart = Date.now();

	try {
		// Download the image from S3
		console.log(
			"📥 Downloading image from S3:",
			`s3://${message.bucketName}/${message.objectKey}`,
		);
		const downloadStart = Date.now();

		const getObjectCommand = new GetObjectCommand({
			Bucket: message.bucketName,
			Key: message.objectKey,
		});

		const response = await s3Client.send(getObjectCommand);

		if (!response.Body) {
			throw new Error("S3 object has no body");
		}

		// Convert stream to buffer
		const chunks: Uint8Array[] = [];
		const reader = response.Body.transformToWebStream().getReader();

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			chunks.push(value);
		}

		const imageBuffer = Buffer.concat(chunks);
		const downloadDuration = Date.now() - downloadStart;
		console.log(
			`✅ Image downloaded successfully from S3: ${bytesToKB(imageBuffer.length)} KB (${downloadDuration}ms)`,
		);

		// Get original image metadata
		console.log("🔍 Analyzing image metadata...");
		const metadataStart = Date.now();
		const metadata = await sharp(imageBuffer).metadata();
		const originalWidth = metadata.width!;
		const originalHeight = metadata.height!;
		const aspectRatio = originalWidth / originalHeight;
		const metadataDuration = Date.now() - metadataStart;

		console.log(`📊 Original image info (${metadataDuration}ms):`, {
			format: metadata.format,
			width: originalWidth,
			height: originalHeight,
			aspectRatio: aspectRatio.toFixed(2),
			channels: metadata.channels,
			density: metadata.density,
			hasAlpha: metadata.hasAlpha,
			space: metadata.space,
		});

		// Generate responsive sizes based on breakpoints and aspect ratio
		const responsiveSizes = RESPONSIVE_BREAKPOINTS.map((width) => ({
			name: `w${width}`,
			width,
			height: Math.round(width / aspectRatio),
		}));

		console.log(
			"📐 Generated responsive sizes:",
			responsiveSizes.map((s) => `${s.name}: ${s.width}x${s.height}`),
		);

		// Process image for different sizes and formats with serial compression and parallel uploads
		console.log(
			`🔧 Starting optimization for ${responsiveSizes.length} sizes × ${message.requestedFormats.length} formats = ${responsiveSizes.length * message.requestedFormats.length} variants`,
		);
		console.log(`⚡ Processing with serial compression and parallel uploads`);

		const processingStart = Date.now();
		await processS3ImageVariantsOptimized(
			imageBuffer,
			responsiveSizes,
			message,
		);
		const processingDuration = Date.now() - processingStart;
		const totalDuration = Date.now() - optimizationStart;

		console.log(`✅ All image variants processed successfully!`);
		console.log(`⏱️ Timing breakdown:
		- Download: ${downloadDuration}ms
		- Metadata: ${metadataDuration}ms  
		- Processing: ${processingDuration}ms
		- Total: ${totalDuration}ms`);
	} catch (error) {
		const totalDuration = Date.now() - optimizationStart;
		console.error(`❌ Error optimizing S3 image (after ${totalDuration}ms):`, {
			bucketName: message.bucketName,
			objectKey: message.objectKey,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		throw error;
	}
}

async function processS3ImageVariantsOptimized(
	originalBuffer: Buffer,
	responsiveSizes: Array<{ name: string; width: number; height: number }>,
	message: S3ImageOptimizationMessage,
): Promise<void> {
	// Create base Sharp instance for reuse
	const baseSharp = sharp(originalBuffer);

	try {
		// Process compression in series, collect upload tasks
		const uploadTasks: Promise<void>[] = [];

		// Process each variant sequentially for compression
		for (const format of message.requestedFormats) {
			for (const size of responsiveSizes) {
				const uploadTask = processS3ImageVariantSeries(
					baseSharp.clone(),
					size.name,
					{ width: size.width, height: size.height },
					format,
					message,
				);
				uploadTasks.push(uploadTask);
			}
		}

		// Execute all uploads in parallel without restriction
		console.log(`📤 Starting ${uploadTasks.length} parallel uploads`);
		await Promise.all(uploadTasks);
	} finally {
		// Explicit cleanup - destroy the base Sharp instance
		baseSharp.destroy();

		// Force garbage collection if available (Lambda containers often have it enabled)
		if (global.gc) {
			global.gc();
		}
	}
}

async function processS3ImageVariantSeries(
	sharpInstance: sharp.Sharp,
	sizeName: string,
	dimensions: { width: number; height: number },
	format: string,
	message: S3ImageOptimizationMessage,
): Promise<void> {
	const variantStart = Date.now();
	console.log(
		`🎨 Processing ${format} variant for ${sizeName} (${dimensions.width}x${dimensions.height})`,
	);

	let optimizedBuffer: Buffer;
	let contentType: string;
	let fileExtension: string;
	let optimizedKey: string;

	try {
		// Single operation: resize + format conversion + compression (in series)
		const processingStart = Date.now();
		switch (format) {
			case "webp":
				optimizedBuffer = await sharpInstance
					.resize(dimensions.width, dimensions.height, {
						fit: "cover",
						position: "centre",
					})
					.webp({
						quality: 85,
						effort: 4,
						nearLossless: false,
					})
					.toBuffer();
				contentType = "image/webp";
				fileExtension = "webp";
				break;
			case "avif":
				optimizedBuffer = await sharpInstance
					.resize(dimensions.width, dimensions.height, {
						fit: "cover",
						position: "centre",
					})
					.avif({
						quality: 85,
						effort: 4,
						chromaSubsampling: "4:2:0",
					})
					.toBuffer();
				contentType = "image/avif";
				fileExtension = "avif";
				break;
			case "jpeg":
				optimizedBuffer = await sharpInstance
					.resize(dimensions.width, dimensions.height, {
						fit: "cover",
						position: "centre",
					})
					.jpeg({
						quality: 85,
						progressive: true,
						mozjpeg: true,
					})
					.toBuffer();
				contentType = "image/jpeg";
				fileExtension = "jpg";
				break;
			default:
				throw new Error(
					`Unsupported format: ${format}. Supported formats are: ${SUPPORTED_FORMATS.join(", ")}`,
				);
		}
		const processingDuration = Date.now() - processingStart;
		console.log(
			`   ✅ Processed ${format} ${sizeName}: ${bytesToKB(optimizedBuffer.length)} KB (${processingDuration}ms)`,
		);

		// Generate S3 key for the optimized image based on original S3 object key
		const filename = message.objectKey.split("/").pop() || "image";
		const baseKey = filename.replace(/\.[^/.]+$/, "");
		optimizedKey = `optimized/${baseKey}-${sizeName}.${fileExtension}`;

		// Return upload task to be executed in parallel later
		if (UPLOAD_TO_S3) {
			console.log(`📋 Queuing upload for ${format} variant: ${optimizedKey}`);

			// Upload to S3 (this will execute in parallel)
			const uploadStart = Date.now();
			const uploadCommand = new PutObjectCommand({
				Bucket: process.env.S3_BUCKET || message.bucketName, // Use source bucket if no destination specified
				Key: optimizedKey,
				Body: optimizedBuffer,
				ContentType: contentType,
				Metadata: {
					originalBucket: message.bucketName,
					originalKey: message.objectKey,
					size: sizeName,
					format: format,
					width: dimensions.width.toString(),
					height: dimensions.height.toString(),
				},
			});

			await s3Client.send(uploadCommand);
			const uploadDuration = Date.now() - uploadStart;

			const totalVariantDuration = Date.now() - variantStart;
			console.log(
				`   📤 Uploaded ${format} ${sizeName}: ${optimizedKey} (upload: ${uploadDuration}ms, total: ${totalVariantDuration}ms)`,
			);
		} else {
			console.log(
				`⏭️ Skipping S3 upload for ${format} variant: ${optimizedKey} (${bytesToKB(optimizedBuffer.length)} KB) - UPLOAD_TO_S3 flag is false`,
			);
		}

		// Record the optimized image variant in the database
		await recordOptimizedImageVariant(
			message.objectKey,
			optimizedKey,
			dimensions.width,
			dimensions.height,
			optimizedBuffer.length,
			format,
		);
	} catch (error) {
		const totalVariantDuration = Date.now() - variantStart;
		console.error(
			`❌ Error processing ${format} variant for ${sizeName} (after ${totalVariantDuration}ms):`,
			{
				error: error instanceof Error ? error.message : String(error),
				dimensions,
				format,
				sizeName,
				stack: error instanceof Error ? error.stack : undefined,
			},
		);
		throw error;
	} finally {
		// Clean up Sharp instance to free memory
		sharpInstance.destroy();
	}
}

async function recordOptimizedImageVariant(
	originalS3Key: string,
	optimizedS3Key: string,
	width: number,
	height: number,
	fileSize: number,
	format: string,
): Promise<void> {
	if (!isDatabaseEnabled()) {
		console.log("📊 Database not enabled, skipping variant recording");
		return;
	}

	try {
		const db = getDatabaseClient();
		console.log(
			`📊 Testing database connection and recording variant: ${optimizedS3Key}`,
		);

		// Simple connection test - query users table count
		const userCount = await db.query.users.findMany({ limit: 1 });
		console.log(
			`✅ Database connection successful! Found ${userCount.length} users (showing first 1)`,
		);

		// In a real implementation, you would:
		// 1. Find or create the media item record based on originalS3Key
		// 2. Insert the image variant into the imageVariants table
		// This is just a placeholder showing how to use the database

		console.log(
			`✅ Would record variant: ${optimizedS3Key} (${width}x${height}, ${format}, ${fileSize} bytes)`,
		);
	} catch (error) {
		console.error(
			"❌ Error with database connection or recording variant:",
			error,
		);
		// Don't throw - this is not critical to the main optimization process
	}
}
