import { useEffect, useState } from 'react';

import { fetchBudgets, fetchCategories, fetchOverview, fetchTransactions } from '../lib/api';
import type { BudgetsResponse, CategoriesResponse, Overview, Transaction } from '../types';

interface CashflowData {
  overview: Overview | null;
  transactions: Transaction[];
  categories: CategoriesResponse['items'];
  budgets: BudgetsResponse['items'];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useCashflowData(month: string): CashflowData {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoriesResponse['items']>([]);
  const [budgets, setBudgets] = useState<BudgetsResponse['items']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const [nextOverview, nextTransactions, nextCategories, nextBudgets] = await Promise.all([
        fetchOverview(month),
        fetchTransactions(month),
        fetchCategories(),
        fetchBudgets(month),
      ]);

      setOverview(nextOverview);
      setTransactions(nextTransactions);
      setCategories(nextCategories.items);
      setBudgets(nextBudgets.items);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, [month]);

  return {
    overview,
    transactions,
    categories,
    budgets,
    isLoading,
    error,
    reload,
  };
}
