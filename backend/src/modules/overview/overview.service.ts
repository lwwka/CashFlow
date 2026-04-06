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

  async getMonthlyOverview(month: string, userEmail?: string): Promise<{
    month: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }> {
    const email = this.userScope.requireUserEmail(userEmail);
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);

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
      month,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
}
