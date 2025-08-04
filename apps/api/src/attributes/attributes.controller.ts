import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { AttributesService } from "./attributes.service";
import { SelectAttributeValueDto } from "./dto/select-attribute-value.dto";

@Controller("attributes")
export class AttributesController {
	constructor(private readonly attributesService: AttributesService) {}

	@Get("selectable/:key/:keyword")
	@ApiOperation({ summary: "Search for options" })
	@ApiOkResponse({
		description: "Lists the matching attribute values, maximum 20",
		type: [SelectAttributeValueDto],
	})
	textSearch(@Param("key") key: string, @Param("keyword") keyword: string) {
		return this.attributesService.findAll();
	}
}
