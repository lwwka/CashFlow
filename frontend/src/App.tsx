import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/AppShell';
import { useAuth } from './providers/AuthProvider';
import { BudgetsPage } from './pages/BudgetsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { TransactionsPage } from './pages/TransactionsPage';

function normalizeMonth(value: string): string {
  if (/^\d{4}-\d{2}$/.test(value)) {
    return value;
  }

  return new Date().toISOString().slice(0, 7);
}

export function App(): JSX.Element {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const [month, setMonth] = useState(normalizeMonth(import.meta.env.VITE_DEFAULT_MONTH ?? new Date().toISOString().slice(0, 7)));

  if (isBootstrapping) {
    return <div className="flex min-h-screen items-center justify-center text-white">Loading auth... 載入登入狀態中</div>;
  }

  return (
    <Routes>
      <Route element={<AuthPage />} path="/auth" />
      <Route
        element={
          isAuthenticated ? <AppShell month={month} onMonthChange={setMonth} /> : <Navigate replace to="/auth" />
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
