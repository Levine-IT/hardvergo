import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import imageUploadConfig from "src/config/image-upload.config";
import s3Config from "src/config/s3.config";
import { ListingImageService } from "./listing-image.service";
import { UserListingsController } from "./user-listings.controller";
import { UserListingsService } from "./user-listings.service";

@Module({
	imports: [
		ConfigModule.forFeature(imageUploadConfig),
		ConfigModule.forFeature(s3Config),
	],
	controllers: [UserListingsController],
	providers: [UserListingsService, ListingImageService],
})
export class UserListingsModule {}
