import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { CreateItemDto } from "./dto/create-item.dto";
import { ItemDto } from "./dto/item.dto";
import { UpdateItemDto } from "./dto/update-item.dto";
import { ItemsService } from "./items.service";

@Controller("items")
export class ItemsController {
	constructor(private readonly itemsService: ItemsService) {}

	@Post()
	create(@Body() createItemDto: CreateItemDto) {
		return this.itemsService.create(createItemDto);
	}

	@Get()
	@ApiOperation({ summary: "Get all items" })
	@ApiOkResponse({
		description: "List items with pagination",
		type: [ItemDto],
	})
	findAll() {
		return this.itemsService.findAll();
	}

	@Get(":id")
	@ApiOperation({ summary: "Fetch item by id" })
	@ApiOkResponse({
		type: ItemDto,
	})
	findOne(@Param("id") id: string) {
		return this.itemsService.findOne(+id);
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() updateItemDto: UpdateItemDto) {
		return this.itemsService.update(+id, updateItemDto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.itemsService.remove(+id);
	}
}
