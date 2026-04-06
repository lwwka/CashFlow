import { BadRequestException, Injectable } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';

@Injectable()
export class OverviewService {
  constructor(private readonly databaseService: DatabaseService) {}

  private requireUserEmail(userEmail?: string): string {
    if (!userEmail) {
      throw new BadRequestException('userEmail is required');
    }

    return userEmail;
  }

  async getMonthlyOverview(month: string, userEmail?: string): Promise<{
    month: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }> {
    const email = this.requireUserEmail(userEmail);
    const result = await this.databaseService.query<{
      total_income: string | null;
      total_expense: string | null;
    }>(
      `
        SELECT
          COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0)::text AS total_income,
          COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0)::text AS total_expense
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        WHERE u.email = $1
          AND to_char(t.occurred_on, 'YYYY-MM') = $2
          AND t.deleted_at IS NULL
      `,
      [email, month],
    );

    const row = result.rows[0];
    const totalIncome = Number(row?.total_income ?? 0);
    const totalExpense = Number(row?.total_expense ?? 0);

    return {
      month,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
}
