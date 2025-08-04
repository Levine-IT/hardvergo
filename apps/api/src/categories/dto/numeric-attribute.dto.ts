import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export enum NumericAttributeType {
	Integer = "integer",
	Float = "float",
}

export class NumericAttributeDto {
	@ApiProperty({ description: "Attribute name/key" })
	@IsString()
	key: string;

	@ApiProperty({ description: "Human-readable label" })
	@IsString()
	label: string;

	@ApiPropertyOptional({
		description: "Minimum value for this attribute",
	})
	@IsOptional()
	minValue?: number;

	@ApiPropertyOptional({
		description: "Maximum value for this attribute",
	})
	@IsOptional()
	maxValue?: number;

	@ApiProperty({
		enum: NumericAttributeType,
		description: "Type of numeric attribute",
	})
	type: NumericAttributeType;

	@ApiProperty({ description: "Whether this attribute is required" })
	required: boolean;
}
