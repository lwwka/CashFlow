import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PoolClient } from 'pg';

import { DatabaseService } from '../../database/database.service';
import { SeedRequestDto } from './dev-seed.controller';

@Injectable()
export class DevSeedService {
  constructor(private readonly databaseService: DatabaseService) {}

  async load(body: SeedRequestDto): Promise<{
    message: string;
    userEmail: string;
    inserted: { categories: number; transactions: number; budgets: number };
  }> {
    const client = await this.databaseService.getClient();

    try {
      await client.query('BEGIN');

      const userId = await this.upsertUser(client, body.userEmail, body.passwordHash ?? 'demo-password-hash');
      const categoryMap = await this.upsertCategories(client, userId, body.categories);
      const transactions = await this.insertTransactions(client, userId, categoryMap, body.transactions);
      const budgets = await this.upsertBudgets(client, userId, categoryMap, body.budgets);

      await client.query('COMMIT');

      return {
        message: 'seed loaded',
        userEmail: body.userEmail,
        inserted: {
          categories: body.categories.length,
          transactions,
          budgets,
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async upsertUser(client: PoolClient, email: string, passwordHash: string): Promise<string> {
    const result = await client.query<{ id: string }>(
      `
        INSERT INTO users (email, password_hash)
        VALUES ($1, $2)
        ON CONFLICT (email)
        DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          updated_at = NOW()
        RETURNING id
      `,
      [email, passwordHash],
    );

    return result.rows[0].id;
  }

  private async upsertCategories(
    client: PoolClient,
    userId: string,
    categories: SeedRequestDto['categories'],
  ): Promise<Map<string, string>> {
    const categoryMap = new Map<string, string>();

    for (const category of categories) {
      const result = await client.query<{ id: string }>(
        `
          INSERT INTO categories (user_id, name, type)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, name, type)
          DO UPDATE SET updated_at = NOW()
          RETURNING id
        `,
        [userId, category.name, category.type],
      );

      categoryMap.set(`${category.type}:${category.name}`, result.rows[0].id);
    }

    return categoryMap;
  }

  private async insertTransactions(
    client: PoolClient,
    userId: string,
    categoryMap: Map<string, string>,
    transactions: SeedRequestDto['transactions'],
  ): Promise<number> {
    let inserted = 0;

    for (const transaction of transactions) {
      const categoryId = transaction.categoryName
        ? categoryMap.get(`${transaction.type}:${transaction.categoryName}`)
        : null;

      await client.query(
        `
          INSERT INTO transactions (id, user_id, category_id, type, amount, occurred_on, note)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          randomUUID(),
          userId,
          categoryId ?? null,
          transaction.type,
          transaction.amount,
          transaction.occurredOn,
          transaction.note ?? null,
        ],
      );

      inserted += 1;
    }

    return inserted;
  }

  private async upsertBudgets(
    client: PoolClient,
    userId: string,
    categoryMap: Map<string, string>,
    budgets: SeedRequestDto['budgets'],
  ): Promise<number> {
    let upserted = 0;

    for (const budget of budgets) {
      const categoryId = budget.categoryName ? categoryMap.get(`expense:${budget.categoryName}`) : null;

      await client.query(
        `
          INSERT INTO budgets (id, user_id, category_id, month, amount)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (user_id, month, category_id)
          DO UPDATE SET
            amount = EXCLUDED.amount,
            updated_at = NOW()
        `,
        [randomUUID(), userId, categoryId ?? null, budget.month, budget.amount],
      );

      upserted += 1;
    }

    return upserted;
  }
}
