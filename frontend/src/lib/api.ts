import type {
  AuthProfile,
  AuthResponse,
  Budget,
  BudgetsResponse,
  CategoriesResponse,
  Category,
  DownloadReportResult,
  FinancialGoal,
  ImportTransactionRow,
  ImportTransactionsResult,
  MonthlyGoal,
  Overview,
  Transaction,
} from '../types';

interface DateRangeFilter {
  month?: string;
  from?: string;
  to?: string;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

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
  const token = localStorage.getItem('cashflow-access-token');
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();

  if (!response.ok) {
    throw new ApiError(text || `Request failed with status ${response.status}`, response.status);
  }

  if (!text.trim()) {
    throw new ApiError(`Empty response from ${path}`, response.status);
  }

  if (!contentType.includes('application/json')) {
    throw new ApiError(text || `Unexpected response type from ${path}`, response.status);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(text || `Invalid JSON response from ${path}`, response.status);
  }
}

async function requestBlob(path: string, init?: RequestInit): Promise<DownloadReportResult> {
  const token = localStorage.getItem('cashflow-access-token');
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || `Request failed with status ${response.status}`, response.status);
  }

  const contentDisposition = response.headers.get('content-disposition') ?? '';
  const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);

  return {
    blob: await response.blob(),
    filename: filenameMatch?.[1] ?? 'cashflow-report.csv',
  };
}

export function register(payload: { email: string; password: string }): Promise<AuthResponse> {
  return requestJson('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload: { email: string; password: string }): Promise<AuthResponse> {
  return requestJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchMe(): Promise<AuthProfile> {
  return requestJson('/auth/me');
}

export function fetchOverview(filter: DateRangeFilter): Promise<Overview> {
  return requestJson(`/overview${buildQuery({ month: filter.month, from: filter.from, to: filter.to })}`);
}

export function fetchMonthlyGoal(month: string): Promise<MonthlyGoal | null> {
  return requestJson(`/monthly-goals${buildQuery({ month })}`);
}

export function upsertMonthlyGoal(payload: { month: string; savingsTarget: number }): Promise<MonthlyGoal> {
  return requestJson('/monthly-goals', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function fetchFinancialGoal(goalType: string): Promise<FinancialGoal | null> {
  return requestJson(`/financial-goals${buildQuery({ goalType })}`);
}

export function upsertFinancialGoal(payload: { goalType: string; targetAmount: number }): Promise<FinancialGoal> {
  return requestJson('/financial-goals', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function fetchTransactions(filter?: DateRangeFilter): Promise<Transaction[]> {
  return requestJson(`/transactions${buildQuery({ month: filter?.month, from: filter?.from, to: filter?.to })}`);
}

export function fetchCategories(): Promise<CategoriesResponse> {
  return requestJson('/categories');
}

export function fetchBudgets(month: string): Promise<BudgetsResponse> {
  return requestJson(`/budgets${buildQuery({ month })}`);
}

export function createCategory(payload: { name: string; type: 'income' | 'expense' }): Promise<Category> {
  return requestJson('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCategory(
  id: string,
  payload: { name?: string; type?: 'income' | 'expense' },
): Promise<Category> {
  return requestJson(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(id: string): Promise<{ id: string; deleted: true }> {
  return requestJson(`/categories/${id}`, {
    method: 'DELETE',
  });
}

export function createTransaction(payload: {
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

export function importTransactions(rows: ImportTransactionRow[]): Promise<ImportTransactionsResult> {
  return requestJson('/transactions/import', {
    method: 'POST',
    body: JSON.stringify({ rows }),
  });
}

export function updateTransaction(
  id: string,
  payload: {
    type?: 'income' | 'expense';
    amount?: number;
    occurredOn?: string;
    categoryId?: string;
    note?: string;
  },
): Promise<Transaction> {
  return requestJson(`/transactions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteTransaction(id: string): Promise<{ id: string; deleted: true }> {
  return requestJson(`/transactions/${id}`, {
    method: 'DELETE',
  });
}

export function upsertBudget(payload: {
  month: string;
  amount: number;
  categoryId?: string;
}): Promise<Budget> {
  return requestJson('/budgets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteBudget(id: string): Promise<{ id: string; deleted: true }> {
  return requestJson(`/budgets/${id}`, {
    method: 'DELETE',
  });
}

export function downloadTransactionsReport(filter: DateRangeFilter): Promise<DownloadReportResult> {
  return requestBlob(`/reports/transactions.csv${buildQuery({ month: filter.month, from: filter.from, to: filter.to })}`);
}

export function downloadSummaryReport(filter: DateRangeFilter): Promise<DownloadReportResult> {
  return requestBlob(`/reports/summary.csv${buildQuery({ month: filter.month, from: filter.from, to: filter.to })}`);
}
