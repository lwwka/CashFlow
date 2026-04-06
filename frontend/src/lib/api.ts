import type { Budget, BudgetsResponse, CategoriesResponse, Category, Overview, Transaction } from '../types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

function buildQuery(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function fetchOverview(userEmail: string, month: string): Promise<Overview> {
  return requestJson(`/overview${buildQuery({ userEmail, month })}`);
}

export function fetchTransactions(userEmail: string, month?: string): Promise<Transaction[]> {
  return requestJson(`/transactions${buildQuery({ userEmail, month })}`);
}

export function fetchCategories(userEmail: string): Promise<CategoriesResponse> {
  return requestJson(`/categories${buildQuery({ userEmail })}`);
}

export function fetchBudgets(userEmail: string, month: string): Promise<BudgetsResponse> {
  return requestJson(`/budgets${buildQuery({ userEmail, month })}`);
}

export function createCategory(payload: { userEmail: string; name: string; type: 'income' | 'expense' }): Promise<Category> {
  return requestJson('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createTransaction(payload: {
  userEmail: string;
  type: 'income' | 'expense';
  amount: number;
  occurredOn: string;
  categoryId?: string;
  note?: string;
}): Promise<Transaction> {
  return requestJson('/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteTransaction(id: string, userEmail: string): Promise<{ id: string; deleted: true }> {
  return requestJson(`/transactions/${id}${buildQuery({ userEmail })}`, {
    method: 'DELETE',
  });
}

export function upsertBudget(payload: {
  userEmail: string;
  month: string;
  amount: number;
  categoryId?: string;
}): Promise<Budget> {
  return requestJson('/budgets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
