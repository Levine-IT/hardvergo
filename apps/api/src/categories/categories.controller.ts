import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Category } from './entities/category.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiOkResponse({
    description: 'List all categories',
    type: [Category]
    })
  findAll() {
    return this.categoriesService.findAll();
  }
}
