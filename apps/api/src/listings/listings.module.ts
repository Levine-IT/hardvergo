import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import imageUploadConfig from "../config/image-upload.config";
import s3Config from "../config/s3.config";
import { ListingImageService } from "./listing-image.service";
import { ListingsController } from "./listings.controller";
import { ListingsService } from "./listings.service";
import { UserListingsController } from "./user-listing.controller";

@Module({
	imports: [
		ConfigModule.forFeature(imageUploadConfig),
		ConfigModule.forFeature(s3Config),
	],
	controllers: [ListingsController, UserListingsController],
	providers: [ListingsService, ListingImageService],
})
export class ListingsModule {}
