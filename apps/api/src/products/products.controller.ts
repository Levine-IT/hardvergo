import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty } from '@nestjs/swagger';

export class ProductDto {
	@ApiProperty()
	name: string;
	
	@ApiProperty()
	attributes: AttributeDto[]
}

export class AttributeDto {
	@ApiProperty()
	name: string;
}


@Controller('products')
export class ProductsController {
	@Get()
	@ApiOperation({ summary: 'Get all products' })
	@ApiOkResponse({
		description: 'List of products retrieved successfully',
		type: [ProductDto]
	})
	getAll(): ProductDto[] {
		return [{ attributes: [], name: "asd" }];
	}
}
