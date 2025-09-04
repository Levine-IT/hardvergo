import type { DatabaseClient } from "@hardvergo/database";
import type { LamdbaLogger } from "./lamdba-logger";

export class DatabaseRecorder {
	private logger: LamdbaLogger;
	private db: DatabaseClient;

	constructor(logger: LamdbaLogger, databaseClient: DatabaseClient) {
		this.logger = logger;
		this.db = databaseClient;
	}

	async recordOptimizedImageVariant(
		originalS3Key: string,
		optimizedS3Key: string,
		width: number,
		height: number,
		fileSize: number,
		format: string,
	): Promise<void> {
		try {
			this.logger.info(
				"Testing database connection and recording variant",
				{
					optimizedS3Key,
				},
			);

			const userCount = await this.db.query.users.findMany({ limit: 1 });
			this.logger.info("Database connection successful", {
				userCount: userCount.length,
			});

			this.logger.info("Would record variant", {
				optimizedS3Key,
				dimensions: `${width}x${height}`,
				format,
				fileSize,
			});
		} catch (error) {
			this.logger.error(
				"Error with database connection or recording variant",
				error,
			);
		}
	}
}
