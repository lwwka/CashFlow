import { Controller, Get, Query } from '@nestjs/common';

@Controller('reports')
export class ReportsController {
  @Get('monthly')
  getMonthlyTrend(@Query('from') from: string, @Query('to') to: string): {
    from: string;
    to: string;
    points: Array<{ month: string; income: number; expense: number }>;
  } {
    return {
      from,
      to,
      points: [],
    };
  }

  @Get('category-breakdown')
  getCategoryBreakdown(@Query('month') month: string): {
    month: string;
    breakdown: Array<{ category: string; amount: number; percentage: number }>;
  } {
    return {
      month,
      breakdown: [],
    };
  }
}
