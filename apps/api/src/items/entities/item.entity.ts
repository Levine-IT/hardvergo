import { ApiProperty } from "@nestjs/swagger";

export class AttributeValues {
	@ApiProperty()
	id: string;

	@ApiProperty()
	type: string;

	@ApiProperty()
	value: string;
}

/**
 * Item represents some used product that is advertised on the website as for saley
 */
export class Item {
	@ApiProperty()
	title: string;

	@ApiProperty()
	price: number;

	@ApiProperty({ type: [AttributeValues] })
	numericAttributes: AttributeValues[];
}