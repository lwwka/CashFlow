import { fetchTransactions } from '../lib/api';
import type { Transaction } from '../types';
import { useAsyncData } from './useAsyncData';

export function useTransactions(filter?: { month?: string; from?: string; to?: string }) {
  const state = useAsyncData<Transaction[]>(
    async () => fetchTransactions(filter),
    [],
    [filter?.month, filter?.from, filter?.to],
  );

  return {
    transactions: state.data,
    isLoading: state.isLoading,
    error: state.error,
    reload: state.reload,
  };
}
