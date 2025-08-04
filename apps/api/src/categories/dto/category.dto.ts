import { ApiProperty } from "@nestjs/swagger";

/**
 * It desribes that what attributes the items in the given categories should have
 */
export class ItemSchemaDto {}

export class ItemAttributeDto {
	@ApiProperty()
	key: string;

	@ApiProperty()
	type: string; //id value / numeric
}

export class CategoryDto {
	@ApiProperty()
	name: string;

	@ApiProperty({ type: CategoryDto, nullable: true })
	parent?: CategoryDto;

	@ApiProperty({ type: ItemSchemaDto })
	itemSchema: ItemSchemaDto;
}
