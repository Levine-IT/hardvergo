import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { NumericAttributeDto } from "./numeric-attribute.dto";
import { SelectAttributeDto } from "./select-attribute.dto";

export class ListingAttributesDto {
	@ApiProperty({
		type: [NumericAttributeDto],
		description: "Numeric attributes for items in this category",
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => NumericAttributeDto)
	numericAttributes: NumericAttributeDto[];

	@ApiProperty({
		type: [SelectAttributeDto],
		description:
			"Selectable attributes for items in this category. These are disctinct values that can be selected by the user.",
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SelectAttributeDto)
	selectAttributes: SelectAttributeDto[];
}

export class CategoryDto {
	@ApiProperty({
		description: "URL-friendly unique identifier for the category",
		example: "electronics",
	})
	key: string;

	@ApiProperty({ description: "Category name", example: "Electronics" })
	@IsString()
	name: string;

	@ApiPropertyOptional({ type: CategoryDto, description: "Parent category" })
	@IsOptional()
	@ValidateNested()
	@Type(() => CategoryDto)
	parent?: CategoryDto;

	@ApiPropertyOptional({ type: [CategoryDto], description: "Child categories" })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CategoryDto)
	children?: CategoryDto[];

	@ApiProperty({
		type: ListingAttributesDto,
		description: "Attributes for listings in this category",
	})
	listingAttributes: ListingAttributesDto;
}
