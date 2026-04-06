import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { UserScopeService } from '../../prisma/user-scope.service';

export interface BudgetRecord {
  id: string;
  month: string;
  amount: number;
  categoryId?: string | null;
  categoryName?: string | null;
}

@Injectable()
export class BudgetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userScope: UserScopeService,
  ) {}

  async list(month: string, userEmail?: string): Promise<{ month: string; items: BudgetRecord[] }> {
    const email = this.userScope.requireUserEmail(userEmail);

    const budgets = await this.prisma.budget.findMany({
      where: {
        month,
        user: { email },
      },
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: [{ category: { name: 'asc' } }, { createdAt: 'asc' }],
    });

    return {
      month,
      items: budgets.map((budget) => ({
        id: budget.id,
        month: budget.month,
        amount: Number(budget.amount),
        categoryId: budget.categoryId,
        categoryName: budget.category?.name ?? null,
      })),
    };
  }

  async upsert(input: {
    userEmail?: string;
    month: string;
    categoryId?: string;
    amount: number;
  }): Promise<BudgetRecord> {
    const email = this.userScope.requireUserEmail(input.userEmail);
    await this.userScope.assertCategoryOwnership(email, input.categoryId);
    const userId = await this.userScope.getUserIdOrThrow(email);

    const existing = await this.prisma.budget.findFirst({
      where: {
        userId,
        month: input.month,
        categoryId: input.categoryId ?? null,
      },
      select: { id: true },
    });

    const budget = existing
      ? await this.prisma.budget.update({
          where: { id: existing.id },
          data: {
            amount: input.amount,
            categoryId: input.categoryId ?? null,
          },
          include: {
            category: {
              select: { name: true },
            },
          },
        })
      : await this.prisma.budget.create({
          data: {
            userId,
            categoryId: input.categoryId ?? null,
            month: input.month,
            amount: input.amount,
          },
          include: {
            category: {
              select: { name: true },
            },
          },
        });

    return {
      id: budget.id,
      month: budget.month,
      amount: Number(budget.amount),
      categoryId: budget.categoryId,
      categoryName: budget.category?.name ?? null,
    };
  }

  async remove(id: string, userEmail?: string): Promise<{ id: string; deleted: true }> {
    const email = this.userScope.requireUserEmail(userEmail);

    const existing = await this.prisma.budget.findFirst({
      where: {
        id,
        user: { email },
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Budget ${id} not found`);
    }

    await this.prisma.budget.delete({
      where: { id },
    });

    return { id, deleted: true };
  }
}
