import { Injectable } from '@nestjs/common';

export type TransactionType = 'income' | 'expense';

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  amount: number;
  occurredOn: string;
  categoryId?: string;
  note?: string;
}

@Injectable()
export class TransactionsService {
  list(): TransactionRecord[] {
    return [];
  }
}
