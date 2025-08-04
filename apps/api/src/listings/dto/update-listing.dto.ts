import { PartialType } from "@nestjs/swagger";
import { CreateListingDto } from "./create-listing.dto";

export class UpdateItemDto extends PartialType(CreateListingDto) {}
