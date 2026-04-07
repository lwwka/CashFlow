import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';

enum CategoryType {
  Income = 'income',
  Expense = 'expense',
}

class CategoryDto {
  @ApiProperty({ example: 'Food' })
  @IsString()
  @MaxLength(64)
  name!: string;

  @ApiProperty({ enum: CategoryType, example: 'expense' })
  @IsEnum(CategoryType)
  type!: CategoryType;
}

class QueryCategoriesDto {
}

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser): Promise<{ items: unknown[] }> {
    return this.categoriesService.list(user.email);
  }

  @Post()
  create(@Body() body: CategoryDto, @CurrentUser() user: AuthUser): Promise<unknown> {
    return this.categoriesService.create({
      ...body,
      email: user.email,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<CategoryDto>, @CurrentUser() user: AuthUser): Promise<unknown> {
    return this.categoriesService.update(id, {
      ...body,
      email: user.email,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser): Promise<{ id: string; deleted: true }> {
    return this.categoriesService.remove(id, user.email);
  }
}
