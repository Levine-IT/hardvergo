import { ApiProperty } from "@nestjs/swagger";

export class DraftListingDto {
	@ApiProperty({
		type: "object",
		additionalProperties: true,
		description:
			"Serialized stateform for the draft listing, including title, description, price, etc.",
	})
	state?: object;
}
