import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
	@ApiProperty({
		description: "Unique username for the user",
		example: "johndoe123",
	})
	username: string;

	@ApiProperty({
		description: "Number of active listings by the user",
		example: 5,
	})
	activeListings: number;

	@ApiProperty({
		description: "Total number of ratings received",
		example: 42,
	})
	ratingCount: number;

	@ApiProperty({
		description: "Average rating score",
		example: 4.5,
		minimum: 0,
		maximum: 5,
	})
	averageRating: number;

	@ApiProperty({
		description: "Date when the user registered",
		example: "2023-01-15T10:00:00Z",
	})
	registeredAt: Date;

	@ApiProperty({
		description: "Date of user's last activity",
		example: "2024-08-04T14:30:00Z",
	})
	lastActivity: Date;

	@ApiProperty({
		description: "URL to user's profile picture",
		example: "https://example.com/profile-pictures/johndoe.jpg",
	})
	profilePictureUrl: string;

	@ApiProperty({
		description: "User's biography or description",
		example: "Tech enthusiast and gadget collector",
	})
	bio: string;
}
