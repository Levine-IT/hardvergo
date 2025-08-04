import { ApiProperty } from "@nestjs/swagger";

/**
 * It desribes that what attributes the items in the given categories should have
 */
export class ItemSchema {}

export class ItemAttribute {
	@ApiProperty()
	key: string;

	@ApiProperty()
	type: string; //id value / numeric
}

export class Category {
	@ApiProperty()
	name: string;

	@ApiProperty({ type: Category, nullable: true })
	parent?: Category;

	@ApiProperty({ type: ItemSchema })
	itemSchema: ItemSchema;
}
