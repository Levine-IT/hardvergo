import { createDatabaseClient, type DatabaseClient } from "@hardvergo/database";

let dbClient: DatabaseClient | null = null;

export function getDatabaseClient(): DatabaseClient {
	if (!dbClient) {
		const connectionString =
			process.env.DATABASE_URL ||
			"postgresql://postgres:postgres@postgres:54323/postgres";
		if (!connectionString) {
			throw new Error("DATABASE_URL environment variable is not set");
		}
		dbClient = createDatabaseClient(connectionString);
	}
	return dbClient;
}

export function isDatabaseEnabled(): boolean {
	return Boolean(process.env.DATABASE_URL);
}
