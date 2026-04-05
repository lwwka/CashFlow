import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';

@Injectable()
export class OverviewService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getMonthlyOverview(month: string, userEmail = 'demo@cashflow.local'): Promise<{
    month: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }> {
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
      [userEmail, month],
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
