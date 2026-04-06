import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Matches, Min } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { BudgetsService } from './budgets.service';

class BudgetDto {
  @ApiPropertyOptional({ example: 'demo@cashflow.local' })
  @IsOptional()
  @IsString()
  userEmail?: string;

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

  @ApiPropertyOptional({ example: 'demo@cashflow.local' })
  @IsOptional()
  @IsString()
  userEmail?: string;
}

@ApiTags('budgets')
@Controller('budgets')
@UseGuards(OptionalJwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiQuery({ name: 'month', required: true, example: '2026-04' })
  @ApiQuery({ name: 'userEmail', required: false, example: 'demo@cashflow.local' })
  list(@Query() query: QueryBudgetsDto, @CurrentUser() user: AuthUser | null): Promise<{ month: string; items: unknown[] }> {
    return this.budgetsService.list(query.month, user?.email ?? query.userEmail);
  }

  @Post()
  upsert(@Body() body: BudgetDto, @CurrentUser() user: AuthUser | null): Promise<unknown> {
    return this.budgetsService.upsert({
      ...body,
      userEmail: user?.email ?? body.userEmail,
    });
  }

  @Patch()
  patch(@Body() body: BudgetDto, @CurrentUser() user: AuthUser | null): Promise<unknown> {
    return this.budgetsService.upsert({
      ...body,
      userEmail: user?.email ?? body.userEmail,
    });
  }

  @Delete(':id')
  @ApiQuery({ name: 'userEmail', required: false, example: 'demo@cashflow.local' })
  remove(@Param('id') id: string, @Query('userEmail') userEmail: string | undefined, @CurrentUser() user: AuthUser | null): Promise<{ id: string; deleted: true }> {
    return this.budgetsService.remove(id, user?.email ?? userEmail);
  }
}
