import { Controller, Get, Header, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Matches } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

class MonthlyReportQuery {
  @Matches(/^[0-9]{4}-(0[1-9]|1[0-2])$/)
  month!: string;
}

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('transactions.csv')
  @ApiQuery({ name: 'month', required: true, example: '2026-04' })
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async downloadMonthlyTransactionsCsv(
    @Query() query: MonthlyReportQuery,
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    response.setHeader('Content-Disposition', `attachment; filename="cashflow-transactions-${query.month}.csv"`);
    return `\uFEFF${await this.reportsService.buildMonthlyTransactionsCsv(query.month, user.email)}`;
  }

  @Get('summary.csv')
  @ApiQuery({ name: 'month', required: true, example: '2026-04' })
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async downloadMonthlySummaryCsv(
    @Query() query: MonthlyReportQuery,
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    response.setHeader('Content-Disposition', `attachment; filename="cashflow-summary-${query.month}.csv"`);
    return `\uFEFF${await this.reportsService.buildMonthlySummaryCsv(query.month, user.email)}`;
  }
}
