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
import { CreateListingDto } from "./dto/create-listing.dto";
import { ListingDto } from "./dto/listing.dto";
import { UpdateItemDto } from "./dto/update-listing.dto";
import { ListingsService } from "./listings.service";

@Controller("listings")
export class ListingsController {
	constructor(private readonly listingsService: ListingsService) {}

	@Post()
	create(@Body() createItemDto: CreateListingDto) {
		return this.listingsService.create(createItemDto);
	}

	@Get()
	@ApiOperation({ summary: "Get all listings" })
	@ApiOkResponse({
		description: "List listings with pagination",
		type: [ListingDto],
	})
	findAll() {
		return this.listingsService.findAll();
	}

	@Get(":id")
	@ApiOperation({ summary: "Fetch listing by id" })
	@ApiOkResponse({
		type: ListingDto,
	})
	findOne(@Param("id") id: string) {
		return this.listingsService.findOne(+id);
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() updateItemDto: UpdateItemDto) {
		return this.listingsService.update(+id, updateItemDto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.listingsService.remove(+id);
	}
}
