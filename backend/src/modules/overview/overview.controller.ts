import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiPropertyOptional, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { OverviewService } from './overview.service';

class OverviewQuery {
  @Matches(/^[0-9]{4}-(0[1-9]|1[0-2])$/)
  month!: string;

  @ApiPropertyOptional({ example: 'demo@cashflow.local' })
  @IsOptional()
  @IsString()
  userEmail?: string;
}

@ApiTags('overview')
@Controller('overview')
@UseGuards(OptionalJwtAuthGuard)
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @Get()
  @ApiQuery({ name: 'month', required: true, example: '2026-04' })
  @ApiQuery({ name: 'userEmail', required: false, example: 'demo@cashflow.local' })
  getMonthlyOverview(@Query() query: OverviewQuery, @CurrentUser() user: AuthUser | null): Promise<{
    month: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }> {
    return this.overviewService.getMonthlyOverview(query.month, user?.email ?? query.userEmail);
  }
}
