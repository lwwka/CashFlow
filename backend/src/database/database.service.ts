import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    const password = this.configService.get('PGPASSWORD');

    this.pool = new Pool({
      host: this.configService.get<string>('PGHOST') ?? 'localhost',
      port: Number(this.configService.get<string>('PGPORT') ?? '5432'),
      user: this.configService.get<string>('PGUSER') ?? 'postgres',
      password: typeof password === 'string' ? password : '',
      database: this.configService.get<string>('PGDATABASE') ?? 'cashflow',
    });
  }

  query<T extends QueryResultRow>(text: string, params: unknown[] = []): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
