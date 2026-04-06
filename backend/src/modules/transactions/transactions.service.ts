import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { transaction_type } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { UserScopeService } from '../../prisma/user-scope.service';

export type TransactionType = 'income' | 'expense';

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  amount: number;
  occurredOn: string;
  categoryName?: string | null;
  categoryId?: string;
  note?: string;
}

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userScope: UserScopeService,
  ) {}

  private toRecord(transaction: {
    id: string;
    type: transaction_type;
    amount: unknown;
    occurredOn: Date;
    categoryId: string | null;
    note: string | null;
    category?: { name: string } | null;
  }): TransactionRecord {
    return {
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      occurredOn: transaction.occurredOn.toISOString().slice(0, 10),
      categoryId: transaction.categoryId ?? undefined,
      categoryName: transaction.category?.name ?? null,
      note: transaction.note ?? undefined,
    };
  }

  async list(query: { userEmail?: string; month?: string; q?: string }): Promise<TransactionRecord[]> {
    const email = this.userScope.requireUserEmail(query.userEmail);
    const monthStart = query.month ? new Date(`${query.month}-01T00:00:00.000Z`) : null;
    const monthEnd = monthStart ? new Date(monthStart) : null;
    if (monthEnd) {
      monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        user: { email },
        deletedAt: null,
        ...(monthStart && monthEnd
          ? {
              occurredOn: {
                gte: monthStart,
                lt: monthEnd,
              },
            }
          : {}),
        ...(query.q
          ? {
              OR: [
                { note: { contains: query.q, mode: 'insensitive' } },
                { category: { name: { contains: query.q, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: [{ occurredOn: 'desc' }, { createdAt: 'desc' }],
    });

    return transactions.map((transaction) => this.toRecord(transaction));
  }

  async create(input: {
    userEmail?: string;
    type: TransactionType;
    amount: number;
    occurredOn: string;
    categoryId?: string;
    note?: string;
  }): Promise<TransactionRecord> {
    const email = this.userScope.requireUserEmail(input.userEmail);
    await this.userScope.assertCategoryOwnership(email, input.categoryId);
    const userId = await this.userScope.getUserIdOrThrow(email);

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        categoryId: input.categoryId ?? null,
        type: input.type,
        amount: input.amount,
        occurredOn: new Date(`${input.occurredOn}T00:00:00.000Z`),
        note: input.note ?? null,
      },
      include: {
        category: {
          select: { name: true },
        },
      },
    });

    return this.toRecord(transaction);
  }

  async update(
    id: string,
    input: {
      userEmail?: string;
      type?: TransactionType;
      amount?: number;
      occurredOn?: string;
      categoryId?: string;
      note?: string;
    },
  ): Promise<TransactionRecord> {
    const email = this.userScope.requireUserEmail(input.userEmail);
    await this.userScope.assertCategoryOwnership(email, input.categoryId);

    const existing = await this.prisma.transaction.findFirst({
      where: {
        id,
        deletedAt: null,
        user: { email },
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...(input.type ? { type: input.type } : {}),
        ...(typeof input.amount === 'number' ? { amount: input.amount } : {}),
        ...(input.occurredOn ? { occurredOn: new Date(`${input.occurredOn}T00:00:00.000Z`) } : {}),
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
      },
      include: {
        category: {
          select: { name: true },
        },
      },
    });

    return this.toRecord(transaction);
  }

  async remove(id: string, userEmail?: string): Promise<{ id: string; deleted: true }> {
    const email = this.userScope.requireUserEmail(userEmail);

    const existing = await this.prisma.transaction.findFirst({
      where: {
        id,
        deletedAt: null,
        user: { email },
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    await this.prisma.transaction.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { id, deleted: true };
  }
}
