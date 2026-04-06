import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID, Matches, Min } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BudgetsService } from './budgets.service';

class BudgetDto {
  @ApiProperty({ example: '2026-04' })
  @Matches(/^[0-9]{4}-(0[1-9]|1[0-2])$/)
  month!: string;

  @ApiPropertyOptional({ example: '11111111-1111-1111-1111-111111111111' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 3000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount!: number;
}

class QueryBudgetsDto {
  @ApiProperty({ example: '2026-04' })
  @Matches(/^[0-9]{4}-(0[1-9]|1[0-2])$/)
  month!: string;
}

@ApiTags('budgets')
@Controller('budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiQuery({ name: 'month', required: true, example: '2026-04' })
  list(@Query() query: QueryBudgetsDto, @CurrentUser() user: AuthUser): Promise<{ month: string; items: unknown[] }> {
    return this.budgetsService.list(query.month, user.email);
  }

  @Post()
  upsert(@Body() body: BudgetDto, @CurrentUser() user: AuthUser): Promise<unknown> {
    return this.budgetsService.upsert({
      ...body,
      userEmail: user.email,
    });
  }

  @Patch()
  patch(@Body() body: BudgetDto, @CurrentUser() user: AuthUser): Promise<unknown> {
    return this.budgetsService.upsert({
      ...body,
      userEmail: user.email,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser): Promise<{ id: string; deleted: true }> {
    return this.budgetsService.remove(id, user.email);
  }
}
