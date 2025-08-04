import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SelectAttributeValueDto {
	@ApiProperty({
		description: "Url friendly key of the attribute",
		example: "mhvXdrZT4jP5T8vBxuvm75",
	})
	@IsString()
	key: string;

	@ApiProperty({
		description: "Human-readable label for the value",
		example: "Intel Core i7 11700K",
	})
	@IsString()
	label: string;
}
