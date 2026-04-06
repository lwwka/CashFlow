import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppShell } from './components/AppShell';
import { BudgetsPage } from './pages/BudgetsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';

function normalizeMonth(value: string): string {
  if (/^\d{4}-\d{2}$/.test(value)) {
    return value;
  }

  return new Date().toISOString().slice(0, 7);
}

export function App(): JSX.Element {
  const [userEmail, setUserEmail] = useState(import.meta.env.VITE_DEFAULT_USER_EMAIL ?? 'demo@cashflow.local');
  const [month, setMonth] = useState(normalizeMonth(import.meta.env.VITE_DEFAULT_MONTH ?? new Date().toISOString().slice(0, 7)));

  return (
    <Routes>
      <Route
        element={
          <AppShell month={month} onMonthChange={setMonth} onUserEmailChange={setUserEmail} userEmail={userEmail} />
        }
        path="/"
      >
        <Route element={<DashboardPage />} index />
        <Route element={<TransactionsPage />} path="transactions" />
        <Route element={<CategoriesPage />} path="categories" />
        <Route element={<BudgetsPage />} path="budgets" />
      </Route>
    </Routes>
  );
}
