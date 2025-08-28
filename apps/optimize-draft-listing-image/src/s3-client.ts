import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { S3_CONFIG, UPLOAD_TO_S3 } from "./constants";
import type { Logger } from "./logger";

export class S3Service {
	private client: S3Client;
	private logger: Logger;

	constructor(logger: Logger) {
		this.logger = logger;
		this.client = new S3Client({
			region: S3_CONFIG.region,
			maxAttempts: S3_CONFIG.maxAttempts,
			requestHandler: {
				connectionTimeout: S3_CONFIG.connectionTimeout,
				socketTimeout: S3_CONFIG.socketTimeout,
			},
		});
	}

	async downloadImage(bucketName: string, objectKey: string): Promise<Buffer> {
		this.logger.logDownloadStart(bucketName, objectKey);
		const downloadStart = Date.now();

		const getObjectCommand = new GetObjectCommand({
			Bucket: bucketName,
			Key: objectKey,
		});

		const response = await this.client.send(getObjectCommand);

		if (!response.Body) {
			throw new Error("S3 object has no body");
		}

		const chunks: Uint8Array[] = [];
		const reader = response.Body.transformToWebStream().getReader();

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			chunks.push(value);
		}

		const imageBuffer = Buffer.concat(chunks);
		const downloadDuration = Date.now() - downloadStart;

		this.logger.logDownloadComplete(
			(imageBuffer.length / 1024).toFixed(2),
			downloadDuration,
		);

		return imageBuffer;
	}

	async uploadOptimizedImage(
		bucketName: string,
		key: string,
		buffer: Buffer,
		contentType: string,
		metadata: {
			originalBucket: string;
			originalKey: string;
			size: string;
			format: string;
			width: string;
			height: string;
		},
	): Promise<number> {
		if (!UPLOAD_TO_S3) {
			return 0; // Skip upload if flag is disabled
		}

		const uploadStart = Date.now();
		const uploadCommand = new PutObjectCommand({
			Bucket: process.env.S3_BUCKET || bucketName,
			Key: key,
			Body: buffer,
			ContentType: contentType,
			Metadata: metadata,
		});

		await this.client.send(uploadCommand);
		const uploadDuration = Date.now() - uploadStart;

		return uploadDuration; // Return duration for logging
	}

	generateOptimizedKey(
		originalKey: string,
		sizeName: string,
		fileExtension: string,
	): string {
		const filename = originalKey.split("/").pop() || "image";
		const baseKey = filename.replace(/\.[^/.]+$/, "");
		return `optimized/${baseKey}-${sizeName}.${fileExtension}`;
	}
}
