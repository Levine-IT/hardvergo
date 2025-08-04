import { Module } from "@nestjs/common";
import { CategoriesModule } from "./categories/categories.module";
import { FiltersModule } from "./filters/filters.module";
import { ItemsModule } from "./items/items.module";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [CategoriesModule, ItemsModule, FiltersModule, UsersModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
