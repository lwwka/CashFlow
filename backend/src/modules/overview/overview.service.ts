import { Injectable } from '@nestjs/common';
import { transaction_type } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { UserScopeService } from '../../prisma/user-scope.service';

@Injectable()
export class OverviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userScope: UserScopeService,
  ) {}

  async getMonthlyOverview(filter: { month?: string; from?: string; to?: string }, email: string): Promise<{
    month: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }> {
    let label = filter.month ?? new Date().toISOString().slice(0, 7);
    let start: Date;
    let end: Date;

    if (filter.from && filter.to) {
      start = new Date(`${filter.from}T00:00:00.000Z`);
      end = new Date(`${filter.to}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1);
      label = `${filter.from} → ${filter.to}`;
    } else {
      start = new Date(`${label}-01T00:00:00.000Z`);
      end = new Date(start);
      end.setUTCMonth(end.getUTCMonth() + 1);
    }

    const [incomeAggregate, expenseAggregate] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          user: { email },
          type: transaction_type.income,
          deletedAt: null,
          occurredOn: { gte: start, lt: end },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          user: { email },
          type: transaction_type.expense,
          deletedAt: null,
          occurredOn: { gte: start, lt: end },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(incomeAggregate._sum.amount ?? 0);
    const totalExpense = Number(expenseAggregate._sum.amount ?? 0);

    return {
      month: label,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
}
