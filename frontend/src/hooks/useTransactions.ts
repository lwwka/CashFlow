import { fetchTransactions } from '../lib/api';
import type { Transaction } from '../types';
import { useAsyncData } from './useAsyncData';

export function useTransactions(month?: string) {
  const state = useAsyncData<Transaction[]>(async () => fetchTransactions(month), [], [month]);

  return {
    transactions: state.data,
    isLoading: state.isLoading,
    error: state.error,
    reload: state.reload,
  };
}
