import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  findAll() {
    return `This action returns all categories`;
  }
}
