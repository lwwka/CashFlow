import { Injectable } from '@nestjs/common';
import { transaction_type } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

function escapeCsvValue(value: string | number | null | undefined): string {
  const raw = value == null ? '' : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async buildMonthlyTransactionsCsv(month: string, email: string): Promise<string> {
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        user: { email },
        deletedAt: null,
        occurredOn: { gte: start, lt: end },
      },
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: [{ occurredOn: 'asc' }, { createdAt: 'asc' }],
    });

    const header = ['month', 'occurredOn', 'type', 'category', 'amount', 'note'];
    const rows = transactions.map((transaction) => [
      month,
      transaction.occurredOn.toISOString().slice(0, 10),
      transaction.type,
      transaction.category?.name ?? '',
      Number(transaction.amount).toFixed(2),
      transaction.note ?? '',
    ]);

    return [header, ...rows]
      .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
      .join('\n');
  }

  async buildMonthlySummaryCsv(month: string, email: string): Promise<string> {
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);

    const [incomeAggregate, expenseAggregate, goal, budgets, transactions] = await Promise.all([
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
      this.prisma.monthlyGoal.findFirst({
        where: {
          month,
          user: { email },
        },
        select: {
          savingsTarget: true,
        },
      }),
      this.prisma.budget.findMany({
        where: {
          month,
          user: { email },
          categoryId: { not: null },
        },
        include: {
          category: {
            select: { name: true },
          },
        },
        orderBy: [{ category: { name: 'asc' } }],
      }),
      this.prisma.transaction.findMany({
        where: {
          user: { email },
          type: transaction_type.expense,
          deletedAt: null,
          occurredOn: { gte: start, lt: end },
          categoryId: { not: null },
        },
        select: {
          categoryId: true,
          amount: true,
        },
      }),
    ]);

    const totalIncome = Number(incomeAggregate._sum.amount ?? 0);
    const totalExpense = Number(expenseAggregate._sum.amount ?? 0);
    const balance = totalIncome - totalExpense;
    const savingsTarget = Number(goal?.savingsTarget ?? 0);

    const actualByCategory = new Map<string, number>();
    for (const transaction of transactions) {
      if (!transaction.categoryId) {
        continue;
      }

      actualByCategory.set(
        transaction.categoryId,
        (actualByCategory.get(transaction.categoryId) ?? 0) + Number(transaction.amount),
      );
    }

    const summarySection = [
      ['metric', 'value'],
      ['month', month],
      ['totalIncome', totalIncome.toFixed(2)],
      ['totalExpense', totalExpense.toFixed(2)],
      ['balance', balance.toFixed(2)],
      ['savingsTarget', savingsTarget.toFixed(2)],
      ['targetGap', (savingsTarget - balance).toFixed(2)],
      ['savingsRate', totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(2) : '0.00'],
      [],
      ['category', 'budget', 'actualExpense', 'remaining'],
      ...budgets.map((budget) => {
        const actual = actualByCategory.get(budget.categoryId ?? '') ?? 0;
        return [
          budget.category?.name ?? '',
          Number(budget.amount).toFixed(2),
          actual.toFixed(2),
          (Number(budget.amount) - actual).toFixed(2),
        ];
      }),
    ];

    return summarySection
      .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
      .join('\n');
  }
}
