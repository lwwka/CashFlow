import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsDateString, IsOptional, Matches } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OverviewService } from './overview.service';

class OverviewQuery {
  @IsOptional()
  @Matches(/^[0-9]{4}-(0[1-9]|1[0-2])$/)
  month?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

@ApiTags('overview')
@Controller('overview')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @Get()
  @ApiQuery({ name: 'month', required: true, example: '2026-04' })
  @ApiQuery({ name: 'from', required: false, example: '2026-04-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-04-30' })
  getMonthlyOverview(@Query() query: OverviewQuery, @CurrentUser() user: AuthUser): Promise<{
    month: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }> {
    return this.overviewService.getMonthlyOverview(
      {
        month: query.month,
        from: query.from,
        to: query.to,
      },
      user.email,
    );
  }
}
