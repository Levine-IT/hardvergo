import { Module } from "@nestjs/common";
import { AttributesModule } from "./attributes/attributes.module";
import { CategoriesModule } from "./categories/categories.module";
import { ListingsModule } from "./listings/listings.module";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [CategoriesModule, ListingsModule, UsersModule, AttributesModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
