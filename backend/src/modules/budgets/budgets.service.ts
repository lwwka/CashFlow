import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';

export interface BudgetRecord {
  id: string;
  month: string;
  amount: number;
  categoryId?: string | null;
  categoryName?: string | null;
}

@Injectable()
export class BudgetsService {
  constructor(private readonly databaseService: DatabaseService) {}

  private requireUserEmail(userEmail?: string): string {
    if (!userEmail) {
      throw new BadRequestException('userEmail is required');
    }

    return userEmail;
  }

  async list(month: string, userEmail?: string): Promise<{ month: string; items: BudgetRecord[] }> {
    const email = this.requireUserEmail(userEmail);
    const result = await this.databaseService.query<{
      id: string;
      month: string;
      amount: string;
      category_id: string | null;
      category_name: string | null;
    }>(
      `
        SELECT
          b.id,
          b.month,
          b.amount::text AS amount,
          b.category_id,
          c.name AS category_name
        FROM budgets b
        JOIN users u ON u.id = b.user_id
        LEFT JOIN categories c ON c.id = b.category_id
        WHERE u.email = $1
          AND b.month = $2
        ORDER BY c.name ASC NULLS FIRST, b.created_at ASC
      `,
      [email, month],
    );

    return {
      month,
      items: result.rows.map((row) => ({
        id: row.id,
        month: row.month,
        amount: Number(row.amount),
        categoryId: row.category_id,
        categoryName: row.category_name,
      })),
    };
  }

  async upsert(input: {
    userEmail?: string;
    month: string;
    categoryId?: string;
    amount: number;
  }): Promise<BudgetRecord> {
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
      month: string;
      amount: string;
      category_id: string | null;
      category_name: string | null;
    }>(
      `
        WITH target_user AS (
          SELECT id
          FROM users
          WHERE email = $1
        ),
        written_budget AS (
          INSERT INTO budgets (user_id, category_id, month, amount)
          SELECT tu.id, $2::uuid, $3, $4
          FROM target_user tu
          ON CONFLICT (user_id, month, category_id)
          DO UPDATE SET
            amount = EXCLUDED.amount,
            updated_at = NOW()
          RETURNING id, month, amount::text AS amount, category_id
        )
        SELECT wb.id, wb.month, wb.amount, wb.category_id, c.name AS category_name
        FROM written_budget wb
        LEFT JOIN categories c ON c.id = wb.category_id
      `,
      [email, input.categoryId ?? null, input.month, input.amount],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`User not found for email ${email}`);
    }

    const row = result.rows[0];
    return {
      id: row.id,
      month: row.month,
      amount: Number(row.amount),
      categoryId: row.category_id,
      categoryName: row.category_name,
    };
  }

  async remove(id: string, userEmail?: string): Promise<{ id: string; deleted: true }> {
    const email = this.requireUserEmail(userEmail);
    const result = await this.databaseService.query(
      `
        DELETE FROM budgets b
        USING users u
        WHERE b.id = $1
          AND u.id = b.user_id
          AND u.email = $2
      `,
      [id, email],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Budget ${id} not found`);
    }

    return { id, deleted: true };
  }
}
