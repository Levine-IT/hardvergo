import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FiltersService } from './filters.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UpdateFilterDto } from './dto/update-filter.dto';

@Controller('filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Post()
  create(@Body() createFilterDto: CreateFilterDto) {
    return this.filtersService.create(createFilterDto);
  }

  @Get()
  findAll() {
    return this.filtersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filtersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFilterDto: UpdateFilterDto) {
    return this.filtersService.update(+id, updateFilterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filtersService.remove(+id);
  }
}
