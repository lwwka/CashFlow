export interface Overview {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

export interface CategoriesResponse {
  items: Category[];
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  occurredOn: string;
  categoryId?: string;
  categoryName?: string | null;
  note?: string;
}

export interface Budget {
  id: string;
  month: string;
  amount: number;
  categoryId?: string | null;
  categoryName?: string | null;
}

export interface BudgetsResponse {
  month: string;
  items: Budget[];
}
