import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { ItemsModule } from './items/items.module';

@Module({
  imports: [CategoriesModule, ItemsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
