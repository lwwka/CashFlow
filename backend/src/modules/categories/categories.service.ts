import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';

export interface CategoryRecord {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

@Injectable()
export class CategoriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async list(userEmail = 'demo@cashflow.local'): Promise<{ items: CategoryRecord[] }> {
    const result = await this.databaseService.query<CategoryRecord>(
      `
        SELECT c.id, c.name, c.type
        FROM categories c
        JOIN users u ON u.id = c.user_id
        WHERE u.email = $1
        ORDER BY c.type ASC, c.name ASC
      `,
      [userEmail],
    );

    return { items: result.rows };
  }

  async create(input: { userEmail?: string; name: string; type: 'income' | 'expense' }): Promise<CategoryRecord> {
    const result = await this.databaseService.query<CategoryRecord>(
      `
        INSERT INTO categories (user_id, name, type)
        SELECT u.id, $2, $3
        FROM users u
        WHERE u.email = $1
        ON CONFLICT (user_id, name, type)
        DO UPDATE SET updated_at = NOW()
        RETURNING id, name, type
      `,
      [input.userEmail ?? 'demo@cashflow.local', input.name, input.type],
    );

    return result.rows[0];
  }

  async update(id: string, input: { userEmail?: string; name?: string; type?: 'income' | 'expense' }): Promise<CategoryRecord> {
    const result = await this.databaseService.query<CategoryRecord>(
      `
        UPDATE categories c
        SET
          name = COALESCE($3, c.name),
          type = COALESCE($4, c.type),
          updated_at = NOW()
        FROM users u
        WHERE c.id = $1
          AND u.id = c.user_id
          AND u.email = $2
        RETURNING c.id, c.name, c.type
      `,
      [id, input.userEmail ?? 'demo@cashflow.local', input.name ?? null, input.type ?? null],
    );

    return result.rows[0];
  }

  async remove(id: string, userEmail = 'demo@cashflow.local'): Promise<{ id: string; deleted: true }> {
    await this.databaseService.query(
      `
        DELETE FROM categories c
        USING users u
        WHERE c.id = $1
          AND u.id = c.user_id
          AND u.email = $2
      `,
      [id, userEmail],
    );

    return { id, deleted: true };
  }
}
