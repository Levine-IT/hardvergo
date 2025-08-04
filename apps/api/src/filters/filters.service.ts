import { Injectable } from "@nestjs/common";
import { CreateFilterDto } from "./dto/create-filter.dto";
import { UpdateFilterDto } from "./dto/update-filter.dto";

@Injectable()
export class FiltersService {
	create(createFilterDto: CreateFilterDto) {
		return "This action adds a new filter";
	}

	findAll() {
		return `This action returns all filters`;
	}

	findOne(id: number) {
		return `This action returns a #${id} filter`;
	}

	update(id: number, updateFilterDto: UpdateFilterDto) {
		return `This action updates a #${id} filter`;
	}

	remove(id: number) {
		return `This action removes a #${id} filter`;
	}
}
