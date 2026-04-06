import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
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
@UseGuards(OptionalJwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiQuery({ name: 'userEmail', required: false, example: 'demo@cashflow.local' })
  list(@Query() query: QueryCategoriesDto, @CurrentUser() user: AuthUser | null): Promise<{ items: unknown[] }> {
    return this.categoriesService.list(user?.email ?? query.userEmail);
  }

  @Post()
  create(@Body() body: CategoryDto, @CurrentUser() user: AuthUser | null): Promise<unknown> {
    return this.categoriesService.create({
      ...body,
      userEmail: user?.email ?? body.userEmail,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<CategoryDto>, @CurrentUser() user: AuthUser | null): Promise<unknown> {
    return this.categoriesService.update(id, {
      ...body,
      userEmail: user?.email ?? body.userEmail,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query() query: QueryCategoriesDto, @CurrentUser() user: AuthUser | null): Promise<{ id: string; deleted: true }> {
    return this.categoriesService.remove(id, user?.email ?? query.userEmail);
  }
}
