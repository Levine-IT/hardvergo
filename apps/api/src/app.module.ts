import { DrizzlePGModule } from "@knaadh/nestjs-drizzle-pg";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as schema from "../db/schema";
import { AttributesModule } from "./attributes/attributes.module";
import { CategoriesModule } from "./categories/categories.module";
import { ListingsModule } from "./listings/listings.module";
import { UserActivityModule } from "./user-activity/user-activity.module";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [
		ConfigModule.forRoot(),
		DrizzlePGModule.register({
			tag: "DB",
			pg: {
				connection: "client",
				config: {
					connectionString: process.env.DATABASE_URL,
				},
			},
			config: { schema: { ...schema } },
		}),
		CategoriesModule,
		ListingsModule,
		UsersModule,
		AttributesModule,
		UserActivityModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
