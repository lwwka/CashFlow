import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';

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
  constructor(private readonly databaseService: DatabaseService) {}

  private requireUserEmail(userEmail?: string): string {
    if (!userEmail) {
      throw new BadRequestException('userEmail is required');
    }

    return userEmail;
  }

  async list(query: { userEmail?: string; month?: string; q?: string }): Promise<TransactionRecord[]> {
    const email = this.requireUserEmail(query.userEmail);
    const result = await this.databaseService.query<{
      id: string;
      type: TransactionType;
      amount: string;
      occurred_on: string;
      category_id: string | null;
      category_name: string | null;
      note: string | null;
    }>(
      `
        SELECT
          t.id,
          t.type,
          t.amount::text AS amount,
          to_char(t.occurred_on, 'YYYY-MM-DD') AS occurred_on,
          t.category_id,
          c.name AS category_name,
          t.note
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        LEFT JOIN categories c ON c.id = t.category_id
        WHERE u.email = $1
          AND ($2::text IS NULL OR to_char(t.occurred_on, 'YYYY-MM') = $2)
          AND (
            $3::text IS NULL
            OR COALESCE(t.note, '') ILIKE '%' || $3 || '%'
            OR COALESCE(c.name, '') ILIKE '%' || $3 || '%'
          )
          AND t.deleted_at IS NULL
        ORDER BY t.occurred_on DESC, t.created_at DESC
      `,
      [email, query.month ?? null, query.q ?? null],
    );

    return result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      amount: Number(row.amount),
      occurredOn: row.occurred_on,
      categoryId: row.category_id ?? undefined,
      categoryName: row.category_name,
      note: row.note ?? undefined,
    }));
  }

  async create(input: {
    userEmail?: string;
    type: TransactionType;
    amount: number;
    occurredOn: string;
    categoryId?: string;
    note?: string;
  }): Promise<TransactionRecord> {
    const email = this.requireUserEmail(input.userEmail);
    if (input.categoryId) {
      const categoryCheck = await this.databaseService.query<{ id: string }>(
        `
          SELECT c.id
          FROM categories c
          JOIN users u ON u.id = c.user_id
          WHERE u.email = $1
            AND c.id = $2::uuid
        `,
        [email, input.categoryId],
      );

      if (categoryCheck.rowCount === 0) {
        throw new BadRequestException(`Category ${input.categoryId} does not belong to user ${email}`);
      }
    }

    const result = await this.databaseService.query<{
      id: string;
      type: TransactionType;
      amount: string;
      occurred_on: string;
      category_id: string | null;
      category_name: string | null;
      note: string | null;
    }>(
      `
        INSERT INTO transactions (user_id, category_id, type, amount, occurred_on, note)
        SELECT u.id, $2, $3, $4, $5, $6
        FROM users u
        WHERE u.email = $1
        RETURNING
          id,
          type,
          amount::text AS amount,
          to_char(occurred_on, 'YYYY-MM-DD') AS occurred_on,
          category_id,
          NULL::text AS category_name,
          note
      `,
      [
        email,
        input.categoryId ?? null,
        input.type,
        input.amount,
        input.occurredOn,
        input.note ?? null,
      ],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`User not found for email ${email}`);
    }

    const row = result.rows[0];
    return {
      id: row.id,
      type: row.type,
      amount: Number(row.amount),
      occurredOn: row.occurred_on,
      categoryId: row.category_id ?? undefined,
      categoryName: row.category_name,
      note: row.note ?? undefined,
    };
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
    const email = this.requireUserEmail(input.userEmail);
    if (input.categoryId) {
      const categoryCheck = await this.databaseService.query<{ id: string }>(
        `
          SELECT c.id
          FROM categories c
          JOIN users u ON u.id = c.user_id
          WHERE u.email = $1
            AND c.id = $2::uuid
        `,
        [email, input.categoryId],
      );

      if (categoryCheck.rowCount === 0) {
        throw new BadRequestException(`Category ${input.categoryId} does not belong to user ${email}`);
      }
    }

    const result = await this.databaseService.query<{
      id: string;
      type: TransactionType;
      amount: string;
      occurred_on: string;
      category_id: string | null;
      category_name: string | null;
      note: string | null;
    }>(
      `
        UPDATE transactions t
        SET
          type = COALESCE($3, t.type),
          amount = COALESCE($4, t.amount),
          occurred_on = COALESCE($5, t.occurred_on),
          category_id = COALESCE($6::uuid, t.category_id),
          note = COALESCE($7::text, t.note),
          updated_at = NOW()
        FROM users u
        WHERE t.id = $1
          AND u.id = t.user_id
          AND u.email = $2
          AND t.deleted_at IS NULL
        RETURNING
          t.id,
          t.type,
          t.amount::text AS amount,
          to_char(t.occurred_on, 'YYYY-MM-DD') AS occurred_on,
          t.category_id,
          (
            SELECT c.name
            FROM categories c
            WHERE c.id = t.category_id
          ) AS category_name,
          t.note
      `,
      [
        id,
        email,
        input.type ?? null,
        input.amount ?? null,
        input.occurredOn ?? null,
        input.categoryId ?? null,
        input.note ?? null,
      ],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    const row = result.rows[0];
    return {
      id: row.id,
      type: row.type,
      amount: Number(row.amount),
      occurredOn: row.occurred_on,
      categoryId: row.category_id ?? undefined,
      categoryName: row.category_name,
      note: row.note ?? undefined,
    };
  }

  async remove(id: string, userEmail?: string): Promise<{ id: string; deleted: true }> {
    const email = this.requireUserEmail(userEmail);
    const result = await this.databaseService.query(
      `
        UPDATE transactions t
        SET
          deleted_at = NOW(),
          updated_at = NOW()
        FROM users u
        WHERE t.id = $1
          AND u.id = t.user_id
          AND u.email = $2
          AND t.deleted_at IS NULL
      `,
      [id, email],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    return { id, deleted: true };
  }
}
