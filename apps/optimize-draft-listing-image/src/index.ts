import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { Context, SQSEvent, SQSHandler } from "aws-lambda";
import sharp from "sharp";

interface ImageOptimizationMessage {
	imageUrl: string;
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

	// Process records in parallel for better performance
	const recordPromises = event.Records.map(async (record, index) => {
		console.log(`\n--- Processing Record ${index + 1}/${event.Records.length} ---`);
		console.log("Record ID:", record.messageId);
		console.log("Receipt Handle:", record.receiptHandle?.substring(0, 50) + "...");
		console.log("Event Source:", record.eventSource);
		console.log("Event Source ARN:", record.eventSourceARN);
		console.log("Raw Body:", record.body);

		try {
			const message: ImageOptimizationMessage = JSON.parse(record.body);
			console.log("Parsed message successfully:", {
				imageUrl: message.imageUrl,
				requestedFormats: message.requestedFormats,
			});

			// Validate requested formats
			const invalidFormats = message.requestedFormats.filter(
				format => !SUPPORTED_FORMATS.includes(format as any)
			);
			if (invalidFormats.length > 0) {
				throw new Error(`Unsupported formats: ${invalidFormats.join(', ')}. Supported formats are: ${SUPPORTED_FORMATS.join(', ')}`);
			}

			const startTime = Date.now();
			await optimizeImage(message);
			const duration = Date.now() - startTime;

			console.log(`✅ Successfully processed image: ${message.imageUrl} (${duration}ms)`);
			return { success: true, messageId: record.messageId };
		} catch (error) {
			console.error(`❌ Error processing SQS record ${index + 1}:`, {
				messageId: record.messageId,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined
			});
			return { success: false, messageId: record.messageId, error };
		}
	});

	// Wait for all records to process
	const results = await Promise.allSettled(recordPromises);
	
	let processedCount = 0;
	let errorCount = 0;
	
	results.forEach((result, index) => {
		if (result.status === 'fulfilled' && result.value.success) {
			processedCount++;
		} else {
			errorCount++;
			// If any record failed, throw error to trigger DLQ behavior
			if (result.status === 'fulfilled') {
				throw result.value.error;
			} else {
				throw result.reason;
			}
		}
	});

	console.log("\n=== Lambda Handler Completed ===");
	console.log(`Processed: ${processedCount}, Errors: ${errorCount}`);
	console.log("Remaining Time (ms):", context.getRemainingTimeInMillis());
};

const RESPONSIVE_BREAKPOINTS = [320, 480, 768, 1024, 1200, 1920];

const SUPPORTED_FORMATS = ["webp", "avif", "jpeg"] as const;

const UPLOAD_TO_S3 = process.env.UPLOAD_TO_S3 === 'true' || false;

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

async function optimizeImage(message: ImageOptimizationMessage): Promise<void> {
	console.log("🔄 Starting image optimization for:", message.imageUrl);
	const optimizationStart = Date.now();

	try {
		// Download the image
		console.log("📥 Downloading image from:", message.imageUrl);
		const downloadStart = Date.now();
		const response = await fetch(message.imageUrl);
		
		if (!response.ok) {
			throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
		}

		const imageBuffer = Buffer.from(await response.arrayBuffer());
		const downloadDuration = Date.now() - downloadStart;
		console.log(`✅ Image downloaded successfully: ${bytesToKB(imageBuffer.length)} KB (${downloadDuration}ms)`);

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
			space: metadata.space
		});

		// Generate responsive sizes based on breakpoints and aspect ratio
		const responsiveSizes = RESPONSIVE_BREAKPOINTS.map((width) => ({
			name: `w${width}`,
			width,
			height: Math.round(width / aspectRatio),
		}));

		console.log("📐 Generated responsive sizes:", 
			responsiveSizes.map((s) => `${s.name}: ${s.width}x${s.height}`)
		);

		// Process image for different sizes and formats with serial compression and parallel uploads
		console.log(`🔧 Starting optimization for ${responsiveSizes.length} sizes × ${message.requestedFormats.length} formats = ${responsiveSizes.length * message.requestedFormats.length} variants`);
		console.log(`⚡ Processing with serial compression and parallel uploads`);
		
		const processingStart = Date.now();
		await processImageVariantsOptimized(imageBuffer, responsiveSizes, message);
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
		console.error(`❌ Error optimizing image (after ${totalDuration}ms):`, {
			imageUrl: message.imageUrl,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined
		});
		throw error;
	}
}


async function processImageVariantsOptimized(
	originalBuffer: Buffer,
	responsiveSizes: Array<{ name: string; width: number; height: number }>,
	message: ImageOptimizationMessage
): Promise<void> {
	// Create base Sharp instance for reuse
	const baseSharp = sharp(originalBuffer);
	
	try {
		// Process compression in series, collect upload tasks
		const uploadTasks: Promise<void>[] = [];
		
		// Process each variant sequentially for compression
		for (const format of message.requestedFormats) {
			for (const size of responsiveSizes) {
				const uploadTask = processImageVariantSeries(
					baseSharp.clone(),
					size.name,
					{ width: size.width, height: size.height },
					format,
					message
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

async function processImageVariantSeries(
	sharpInstance: sharp.Sharp,
	sizeName: string,
	dimensions: { width: number; height: number },
	format: string,
	message: ImageOptimizationMessage,
): Promise<void> {
	const variantStart = Date.now();
	console.log(`🎨 Processing ${format} variant for ${sizeName} (${dimensions.width}x${dimensions.height})`);
	
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
						nearLossless: false
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
						chromaSubsampling: '4:2:0'
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
						mozjpeg: true
					})
					.toBuffer();
				contentType = "image/jpeg";
				fileExtension = "jpg";
				break;
			default:
				throw new Error(`Unsupported format: ${format}. Supported formats are: ${SUPPORTED_FORMATS.join(', ')}`);
		}
		const processingDuration = Date.now() - processingStart;
		console.log(`   ✅ Processed ${format} ${sizeName}: ${bytesToKB(optimizedBuffer.length)} KB (${processingDuration}ms)`);

		// Generate S3 key for the optimized image
		const urlPath = new URL(message.imageUrl).pathname;
		const filename = urlPath.split('/').pop() || 'image';
		const baseKey = filename.replace(/\.[^/.]+$/, "");
		optimizedKey = `optimized/${baseKey}-${sizeName}.${fileExtension}`;

		// Return upload task to be executed in parallel later
		if (UPLOAD_TO_S3) {
			console.log(`📋 Queuing upload for ${format} variant: ${optimizedKey}`);
			
			// Upload to S3 (this will execute in parallel)
			const uploadStart = Date.now();
			const uploadCommand = new PutObjectCommand({
				Bucket: process.env.S3_BUCKET || 'default-bucket',
				Key: optimizedKey,
				Body: optimizedBuffer,
				ContentType: contentType,
				Metadata: {
					originalUrl: message.imageUrl,
					size: sizeName,
					format: format,
					width: dimensions.width.toString(),
					height: dimensions.height.toString(),
				},
			});

			await s3Client.send(uploadCommand);
			const uploadDuration = Date.now() - uploadStart;
			
			const totalVariantDuration = Date.now() - variantStart;
			console.log(`   📤 Uploaded ${format} ${sizeName}: ${optimizedKey} (upload: ${uploadDuration}ms, total: ${totalVariantDuration}ms)`);
		} else {
			console.log(`⏭️ Skipping S3 upload for ${format} variant: ${optimizedKey} (${bytesToKB(optimizedBuffer.length)} KB) - UPLOAD_TO_S3 flag is false`);
		}
	} catch (error) {
		const totalVariantDuration = Date.now() - variantStart;
		console.error(`❌ Error processing ${format} variant for ${sizeName} (after ${totalVariantDuration}ms):`, {
			error: error instanceof Error ? error.message : String(error),
			dimensions,
			format,
			sizeName,
			stack: error instanceof Error ? error.stack : undefined
		});
		throw error;
	} finally {
		// Clean up Sharp instance to free memory
		sharpInstance.destroy();
	}
}

