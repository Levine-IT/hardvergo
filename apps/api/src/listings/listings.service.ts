import { Injectable } from "@nestjs/common";
import { CreateListingDto } from "./dto/create-listing.dto";
import { UpdateItemDto } from "./dto/update-listing.dto";

@Injectable()
export class ListingsService {
	create(_: CreateListingDto) {
		return "This action adds a new item";
	}

	findAll() {
		return `This action returns all items`;
	}

	findOne(id: number) {
		return `This action returns a #${id} item`;
	}

	update(id: number, _: UpdateItemDto) {
		return `This action updates a #${id} item`;
	}

	remove(id: number) {
		return `This action removes a #${id} item`;
	}
}
