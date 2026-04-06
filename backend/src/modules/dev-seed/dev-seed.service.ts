import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { SeedRequestDto } from './dev-seed.controller';

@Injectable()
export class DevSeedService {
  constructor(private readonly prisma: PrismaService) {}

  async load(body: SeedRequestDto): Promise<{
    message: string;
    userEmail: string;
    inserted: { categories: number; transactions: number; budgets: number };
  }> {
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email: body.userEmail },
        update: {
          passwordHash: body.passwordHash ?? 'demo-password-hash',
        },
        create: {
          email: body.userEmail,
          passwordHash: body.passwordHash ?? 'demo-password-hash',
        },
        select: { id: true },
      });

      const categoryMap = new Map<string, string>();

      for (const category of body.categories) {
        const saved = await tx.category.upsert({
          where: {
            userId_name_type: {
              userId: user.id,
              name: category.name,
              type: category.type,
            },
          },
          update: {},
          create: {
            userId: user.id,
            name: category.name,
            type: category.type,
          },
          select: { id: true },
        });

        categoryMap.set(`${category.type}:${category.name}`, saved.id);
      }

      let insertedTransactions = 0;
      for (const transaction of body.transactions) {
        const categoryId = transaction.categoryName
          ? categoryMap.get(`${transaction.type}:${transaction.categoryName}`) ?? null
          : null;

        await tx.transaction.create({
          data: {
            userId: user.id,
            categoryId,
            type: transaction.type,
            amount: transaction.amount,
            occurredOn: new Date(`${transaction.occurredOn}T00:00:00.000Z`),
            note: transaction.note ?? null,
          },
        });
        insertedTransactions += 1;
      }

      let upsertedBudgets = 0;
      for (const budget of body.budgets) {
        const categoryId = budget.categoryName ? categoryMap.get(`expense:${budget.categoryName}`) ?? null : null;
        const existing = await tx.budget.findFirst({
          where: {
            userId: user.id,
            month: budget.month,
            categoryId,
          },
          select: { id: true },
        });

        if (existing) {
          await tx.budget.update({
            where: { id: existing.id },
            data: { amount: budget.amount },
          });
        } else {
          await tx.budget.create({
            data: {
              userId: user.id,
              categoryId,
              month: budget.month,
              amount: budget.amount,
            },
          });
        }

        upsertedBudgets += 1;
      }

      return {
        categories: body.categories.length,
        transactions: insertedTransactions,
        budgets: upsertedBudgets,
      };
    });

    return {
      message: 'seed loaded',
      userEmail: body.userEmail,
      inserted: result,
    };
  }
}
