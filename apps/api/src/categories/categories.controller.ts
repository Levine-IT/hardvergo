import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";
import { CategoryDto } from "./dto/category.dto";

@Controller("categories")
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Get()
	@ApiOperation({ summary: "Get all categories" })
	@ApiOkResponse({
		description: "List all categories",
		type: [CategoryDto],
	})
	findAll() {
		return this.categoriesService.findAll();
	}
}
