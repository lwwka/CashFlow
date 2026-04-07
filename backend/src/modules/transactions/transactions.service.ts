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

export interface ImportRowsResult {
  imported: number;
  skipped: number;
  skippedRows: Array<{
    occurredOn: string;
    type: TransactionType;
    amount: number;
    categoryName?: string;
    note?: string;
  }>;
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

  private normalizeImportedAmount(value: unknown): number {
    if (typeof value === 'number') {
      return value;
    }

    return Number(String(value ?? '').replace(/[$,\s]/g, ''));
  }

  async list(query: { email: string; month?: string; from?: string; to?: string; q?: string }): Promise<TransactionRecord[]> {
    let rangeStart: Date | null = null;
    let rangeEndExclusive: Date | null = null;

    if (query.from && query.to) {
      rangeStart = new Date(`${query.from}T00:00:00.000Z`);
      rangeEndExclusive = new Date(`${query.to}T00:00:00.000Z`);
      rangeEndExclusive.setUTCDate(rangeEndExclusive.getUTCDate() + 1);
    } else if (query.month) {
      rangeStart = new Date(`${query.month}-01T00:00:00.000Z`);
      rangeEndExclusive = new Date(rangeStart);
      rangeEndExclusive.setUTCMonth(rangeEndExclusive.getUTCMonth() + 1);
    }

    if (rangeStart && rangeEndExclusive && rangeEndExclusive <= rangeStart) {
      throw new BadRequestException('to must be later than or equal to from');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        user: { email: query.email },
        deletedAt: null,
        ...(rangeStart && rangeEndExclusive
          ? {
              occurredOn: {
                gte: rangeStart,
                lt: rangeEndExclusive,
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
    email: string;
    type: TransactionType;
    amount: number;
    occurredOn: string;
    categoryId?: string;
    note?: string;
  }): Promise<TransactionRecord> {
    await this.userScope.assertCategoryOwnership(input.email, input.categoryId);
    const userId = await this.userScope.getUserIdOrThrow(input.email);

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

  async importRows(input: {
    email: string;
    rows: Array<{
      occurredOn: string;
      type: TransactionType;
      amount: unknown;
      categoryName?: string;
      note?: string;
    }>;
  }): Promise<ImportRowsResult> {
    if (!input.rows.length) {
      throw new BadRequestException('rows must not be empty');
    }

    const userId = await this.userScope.getUserIdOrThrow(input.email);
    const categoryCache = new Map<string, string>();
    let imported = 0;
    let skipped = 0;
    const skippedRows: ImportRowsResult['skippedRows'] = [];

    await this.prisma.$transaction(async (tx) => {
      for (const row of input.rows) {
        const amount = this.normalizeImportedAmount(row.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
          throw new BadRequestException(`Invalid import amount for occurredOn ${row.occurredOn}`);
        }

        const occurredOn = new Date(`${row.occurredOn}T00:00:00.000Z`);
        const normalizedNote = row.note?.trim() ? row.note.trim() : null;

        let categoryId: string | null = null;

        if (row.categoryName?.trim()) {
          const normalizedCategoryName = row.categoryName.trim();
          const cacheKey = `${row.type}:${normalizedCategoryName.toLowerCase()}`;
          categoryId = categoryCache.get(cacheKey) ?? null;

          if (!categoryId) {
            const category = await tx.category.upsert({
              where: {
                userId_name_type: {
                  userId,
                  name: normalizedCategoryName,
                  type: row.type,
                },
              },
              update: {},
              create: {
                userId,
                name: normalizedCategoryName,
                type: row.type,
              },
              select: {
                id: true,
              },
            });

            categoryId = category.id;
            categoryCache.set(cacheKey, category.id);
          }
        }

        const existing = await tx.transaction.findFirst({
          where: {
            userId,
            deletedAt: null,
            occurredOn,
            type: row.type,
            amount,
            categoryId,
            note: normalizedNote,
          },
          select: { id: true },
        });

        if (existing) {
          skipped += 1;
          skippedRows.push({
            occurredOn: row.occurredOn,
            type: row.type,
            amount,
            categoryName: row.categoryName?.trim() || undefined,
            note: normalizedNote ?? undefined,
          });
          continue;
        }

        await tx.transaction.create({
          data: {
            userId,
            categoryId,
            type: row.type,
            amount,
            occurredOn,
            note: normalizedNote,
          },
        });

        imported += 1;
      }
    });

    return { imported, skipped, skippedRows };
  }

  async update(
    id: string,
    input: {
      email: string;
      type?: TransactionType;
      amount?: number;
      occurredOn?: string;
      categoryId?: string;
      note?: string;
    },
  ): Promise<TransactionRecord> {
    await this.userScope.assertCategoryOwnership(input.email, input.categoryId);

    const existing = await this.prisma.transaction.findFirst({
      where: {
        id,
        deletedAt: null,
        user: { email: input.email },
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

  async remove(id: string, email: string): Promise<{ id: string; deleted: true }> {
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
