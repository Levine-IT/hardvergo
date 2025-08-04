import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export enum NumericAttributeType {
	Integer = "integer",
	Float = "float",
}

export class NumericAttributeDto {
	@ApiProperty({
		description: "Attribute name/key",
		example: "vram-size",
	})
	@IsString()
	key: string;

	@ApiProperty({
		description: "Human-readable label",
		example: "VRAM Size (GB)",
	})
	@IsString()
	label: string;

	@ApiPropertyOptional({
		description: "Minimum value for this attribute",
		example: 4,
	})
	@IsOptional()
	minValue?: number;

	@ApiPropertyOptional({
		description: "Maximum value for this attribute",
		example: 24,
	})
	@IsOptional()
	maxValue?: number;

	@ApiProperty({
		enum: NumericAttributeType,
		description: "Type of numeric attribute",
		example: NumericAttributeType.Integer,
	})
	type: NumericAttributeType;

	@ApiProperty({
		description: "Whether this attribute is required",
		example: false,
	})
	required: boolean;
}
