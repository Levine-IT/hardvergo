import { ApiProperty } from "@nestjs/swagger";

export class AttributeValues {
	@ApiProperty()
	id: string;

	@ApiProperty()
	type: string;

	@ApiProperty()
	value: string;
}


export class Media {
	@ApiProperty()
	photos: string;

	@ApiProperty()
	videos: string;
}

/**
 * Item represents some used product that is advertised on the website as for saley
 */
export class Item {
	@ApiProperty()
	title: string;

	@ApiProperty()
	description: string;

	@ApiProperty({ description: "Meant in HUF" })
	price: number;

	@ApiProperty()
	sellerId: string;

	@ApiProperty()
	categoryId: string;

	@ApiProperty({ type: Media })
	media: Media;

	@ApiProperty({ description: "Cities where personal trade is avaible. If null personal trade is not avaible for that item.", nullable: true })
	locations?: string[];

	@ApiProperty({ type: [AttributeValues] })
	numericAttributes: AttributeValues[];
}
