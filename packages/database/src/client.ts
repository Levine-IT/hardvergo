import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export function createDatabaseClient(connectionString: string) {
	const pool = new Pool({
		connectionString,
	});

	return drizzle(pool, { schema });
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;