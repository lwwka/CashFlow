import { Controller, Get, Query } from '@nestjs/common';
import { Matches } from 'class-validator';

class OverviewQuery {
  @Matches(/^[0-9]{4}-(0[1-9]|1[0-2])$/)
  month!: string;
}

@Controller('overview')
export class OverviewController {
  @Get()
  getMonthlyOverview(@Query() query: OverviewQuery): {
    month: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  } {
    return {
      month: query.month,
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    };
  }
}
