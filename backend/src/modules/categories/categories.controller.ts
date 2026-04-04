import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { IsEnum, IsString, MaxLength } from 'class-validator';

enum CategoryType {
  Income = 'income',
  Expense = 'expense',
}

class CategoryDto {
  @IsString()
  @MaxLength(64)
  name!: string;

  @IsEnum(CategoryType)
  type!: CategoryType;
}

@Controller('categories')
export class CategoriesController {
  @Get()
  list(): { items: unknown[] } {
    return { items: [] };
  }

  @Post()
  create(@Body() body: CategoryDto): CategoryDto {
    return body;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<CategoryDto>): { id: string; payload: Partial<CategoryDto> } {
    return { id, payload: body };
  }

  @Delete(':id')
  remove(@Param('id') id: string): { id: string; deleted: true } {
    return { id, deleted: true };
  }
}
