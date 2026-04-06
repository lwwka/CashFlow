import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Matches } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OverviewService } from './overview.service';

class OverviewQuery {
  @Matches(/^[0-9]{4}-(0[1-9]|1[0-2])$/)
  month!: string;
}

@ApiTags('overview')
@Controller('overview')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @Get()
  @ApiQuery({ name: 'month', required: true, example: '2026-04' })
  getMonthlyOverview(@Query() query: OverviewQuery, @CurrentUser() user: AuthUser): Promise<{
    month: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }> {
    return this.overviewService.getMonthlyOverview(query.month, user.email);
  }
}
