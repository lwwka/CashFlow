import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { CategoriesService } from './categories.service';

enum CategoryType {
  Income = 'income',
  Expense = 'expense',
}

class CategoryDto {
  @ApiPropertyOptional({ example: 'demo@cashflow.local' })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiProperty({ example: 'Food' })
  @IsString()
  @MaxLength(64)
  name!: string;

  @ApiProperty({ enum: CategoryType, example: 'expense' })
  @IsEnum(CategoryType)
  type!: CategoryType;
}

class QueryCategoriesDto {
  @ApiPropertyOptional({ example: 'demo@cashflow.local' })
  @IsOptional()
  @IsString()
  userEmail?: string;
}

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiQuery({ name: 'userEmail', required: false, example: 'demo@cashflow.local' })
  list(@Query() query: QueryCategoriesDto): Promise<{ items: unknown[] }> {
    return this.categoriesService.list(query.userEmail);
  }

  @Post()
  create(@Body() body: CategoryDto): Promise<unknown> {
    return this.categoriesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<CategoryDto>): Promise<unknown> {
    return this.categoriesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query() query: QueryCategoriesDto): Promise<{ id: string; deleted: true }> {
    return this.categoriesService.remove(id, query.userEmail);
  }
}
