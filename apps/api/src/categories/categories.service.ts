import { Inject, Injectable } from "@nestjs/common";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "../../db/schema";

@Injectable()
export class CategoriesService {
	constructor(@Inject("DB") private drizzle: NodePgDatabase<typeof schema>) {}

	findAll() {
		return `This action returns all categories`;
	}
}
