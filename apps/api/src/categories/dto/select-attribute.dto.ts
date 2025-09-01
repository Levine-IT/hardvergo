import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";
import { SelectAttributeValueDto } from "src/attributes/dto/select-attribute-value.dto";

export enum SelectAttributeType {
	Single = "single",
}

export class SelectAttributeDto {
	@ApiProperty({
		description: "Attribute name/key",
		example: "cpu-manufacturer",
	})
	@IsString()
	key: string;

	@ApiProperty({
		description: "Human-readable label",
		example: "CPU Manufacturer",
	})
	@IsString()
	label: string;

	@ApiPropertyOptional({
		type: [SelectAttributeValueDto],
		description:
			"Possible values for this attribute. Filled when there is less then 10 distinct values",
	})
	@IsArray()
	@IsString({ each: true })
	values: SelectAttributeValueDto[];

	@ApiProperty({
		description: "Whether this attribute is required",
		example: true,
	})
	required: boolean;
}
