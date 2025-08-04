import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";
import { Category } from "./entities/category.entity";

@Controller("categories")
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Get()
	@ApiOperation({ summary: "Get all categories" })
	@ApiOkResponse({
		description: "List all categories",
		type: [Category],
	})
	findAll() {
		return this.categoriesService.findAll();
	}
}
