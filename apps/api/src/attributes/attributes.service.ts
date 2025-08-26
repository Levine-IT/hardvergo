import type * as schema from "@hardvergo/database/schema";
import { Inject, Injectable } from "@nestjs/common";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

@Injectable()
export class AttributesService {
	constructor(@Inject("DB") private drizzle: NodePgDatabase<typeof schema>) {}

	findAll() {
		return `This action returns all attributes`;
	}
}
