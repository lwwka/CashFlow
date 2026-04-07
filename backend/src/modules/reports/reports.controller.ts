import { Controller, Get, Header, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { IsDateString, IsOptional, Matches } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

class MonthlyReportQuery {
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

function resolveReportFilter(query: MonthlyReportQuery): { month?: string; from?: string; to?: string } {
  if (query.from && query.to) {
    return {
      from: query.from,
      to: query.to,
    };
  }

  return {
    month: query.month,
  };
}

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('transactions.csv')
  @ApiQuery({ name: 'month', required: true, example: '2026-04' })
  @ApiQuery({ name: 'from', required: false, example: '2026-04-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-04-30' })
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async downloadMonthlyTransactionsCsv(
    @Query() query: MonthlyReportQuery,
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    const filter = resolveReportFilter(query);
    const label = filter.month ?? `${filter.from}-to-${filter.to}`;

    response.setHeader('Content-Disposition', `attachment; filename="cashflow-transactions-${label}.csv"`);
    return `\uFEFF${await this.reportsService.buildMonthlyTransactionsCsv(filter, user.email)}`;
  }

  @Get('summary.csv')
  @ApiQuery({ name: 'month', required: true, example: '2026-04' })
  @ApiQuery({ name: 'from', required: false, example: '2026-04-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-04-30' })
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async downloadMonthlySummaryCsv(
    @Query() query: MonthlyReportQuery,
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    const filter = resolveReportFilter(query);
    const label = filter.month ?? `${filter.from}-to-${filter.to}`;

    response.setHeader('Content-Disposition', `attachment; filename="cashflow-summary-${label}.csv"`);
    return `\uFEFF${await this.reportsService.buildMonthlySummaryCsv(filter, user.email)}`;
  }
}
