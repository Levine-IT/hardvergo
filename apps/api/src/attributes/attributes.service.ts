import { Injectable } from "@nestjs/common";

@Injectable()
export class AttributesService {
	findAll() {
		return `This action returns all attributes`;
	}
}
