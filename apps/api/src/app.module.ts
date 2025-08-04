import { Module } from "@nestjs/common";
import { CategoriesModule } from "./categories/categories.module";
import { FiltersModule } from "./filters/filters.module";
import { ListingsModule } from "./items/listings.module";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [CategoriesModule, ListingsModule, FiltersModule, UsersModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
