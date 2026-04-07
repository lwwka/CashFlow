import { ChangeEvent, FormEvent, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

import { Panel } from '../components/Panel';
import { downloadSummaryReport, downloadTransactionsReport, importTransactions } from '../lib/api';
import { useCategories } from '../hooks/useCategories';
import { useTransactionMutations } from '../hooks/useTransactionMutations';
import { useTransactions } from '../hooks/useTransactions';
import { usePreferences } from '../providers/PreferencesProvider';
import type { ImportTransactionRow, Transaction } from '../types';

interface ShellContext {
  month: string;
  fromDate: string;
  toDate: string;
}

interface ImportRowIssue {
  lineNumber: number;
  reason: 'date' | 'type' | 'amount';
  raw: string;
}

type ReportKind = 'transactions' | 'summary';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseDelimitedLine(line: string, delimiter: ',' | '\t'): string[] {
  if (delimiter === '\t') {
    return line.split('\t').map((item) => item.trim());
  }

  return parseCsvLine(line);
}

function normalizeImportAmount(value: string): number {
  return Number(value.replace(/[$,\s]/g, ''));
}

function normalizeImportDate(value: string): string {
  return value.trim().replace(/\//g, '-').slice(0, 10);
}

function parseImportRows(csv: string): { validRows: ImportTransactionRow[]; invalidRows: ImportRowIssue[] } {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { validRows: [], invalidRows: [] };
  }

  const delimiter: ',' | '\t' = lines[0].includes('\t') ? '\t' : ',';
  const [headerLine, ...dataLines] = lines;
  const headers = parseDelimitedLine(headerLine, delimiter).map((item) =>
    item.replace(/^"|"$/g, '').replace(/^\uFEFF/, '').trim().toLowerCase(),
  );
  const indexByHeader = new Map(headers.map((header, index) => [header, index]));
  const validRows: ImportTransactionRow[] = [];
  const invalidRows: ImportRowIssue[] = [];

  dataLines.forEach((line, index) => {
      const lineNumber = index + 2;
      const values = parseDelimitedLine(line, delimiter).map((item) => item.replace(/^"|"$/g, ''));
      const occurredOn = normalizeImportDate(values[indexByHeader.get('occurredon') ?? -1] ?? '');
      const type = values[indexByHeader.get('type') ?? -1] ?? '';
      const amount = normalizeImportAmount(values[indexByHeader.get('amount') ?? -1] ?? '');
      const categoryName = values[indexByHeader.get('categoryname') ?? -1] ?? '';
      const note = values[indexByHeader.get('note') ?? -1] ?? '';
      const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(occurredOn);
      const isValidType = type === 'income' || type === 'expense';
      const isValidAmount = Number.isFinite(amount) && amount > 0;

      if (!isValidDate) {
        invalidRows.push({
          lineNumber,
          reason: 'date',
          raw: line,
        });
        return;
      }

      if (!isValidType) {
        invalidRows.push({
          lineNumber,
          reason: 'type',
          raw: line,
        });
        return;
      }

      if (!isValidAmount) {
        invalidRows.push({
          lineNumber,
          reason: 'amount',
          raw: line,
        });
        return;
      }

      validRows.push({
        occurredOn,
        type: type === 'income' ? 'income' : 'expense',
        amount,
        categoryName: categoryName || undefined,
        note: note || undefined,
      } satisfies ImportTransactionRow);
    });

  return { validRows, invalidRows };
}

function downloadImportTemplate(): void {
  const template = [
    'occurredOn,type,amount,categoryName,note',
    '2026-04-01,expense,88.50,Food,Lunch',
    '2026-04-02,expense,22.00,Transport,Metro',
    '2026-04-03,income,3000.00,Salary,Part-time income',
  ].join('\n');
  const blob = new Blob([`\uFEFF${template}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'cashflow-import-template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function TransactionsPage(): JSX.Element {
  const { month, fromDate, toDate } = useOutletContext<ShellContext>();
  const hasCustomRange = Boolean(fromDate && toDate);
  const { transactions, isLoading: isTransactionsLoading, error: transactionsError, reload: reloadTransactions } = useTransactions(
    hasCustomRange ? { from: fromDate, to: toDate } : { month },
  );
  const { categories, isLoading: isCategoriesLoading, error: categoriesError, reload: reloadCategories } = useCategories();
  const { t } = usePreferences();
  const isLoading = isTransactionsLoading || isCategoriesLoading;
  const error = transactionsError ?? categoriesError;
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    occurredOn: `${month}-01`,
    categoryId: '',
    note: '',
  });
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [importCsv, setImportCsv] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [selectedImportFileName, setSelectedImportFileName] = useState('');
  const [skippedImportRows, setSkippedImportRows] = useState<ImportTransactionRow[]>([]);
  const [reportStatus, setReportStatus] = useState('');
  const [activeReport, setActiveReport] = useState<ReportKind | null>(null);
  const [incomeQuickForm, setIncomeQuickForm] = useState({
    amount: '',
    occurredOn: `${month}-01`,
    note: 'Monthly income',
  });
  const [expenseQuickForm, setExpenseQuickForm] = useState({
    amount: '',
    occurredOn: `${month}-01`,
    note: '',
    categoryId: '',
  });
  const [incomeQuickStatus, setIncomeQuickStatus] = useState('');
  const [expenseQuickStatus, setExpenseQuickStatus] = useState('');
  const availableCategories = categories.filter((category) => category.type === form.type);
  const expenseCategories = categories.filter((category) => category.type === 'expense');
  const isAmountValid = Number(form.amount) > 0;
  const isFormValid = isAmountValid && Boolean(form.occurredOn);
  const isIncomeQuickValid = Number(incomeQuickForm.amount) > 0 && Boolean(incomeQuickForm.occurredOn);
  const isExpenseQuickValid = Number(expenseQuickForm.amount) > 0 && Boolean(expenseQuickForm.occurredOn);
  const importPreview = parseImportRows(importCsv);
  const parsedImportRows = importPreview.validRows;
  const invalidImportRows = importPreview.invalidRows;
  const { status, isSaving, create, update, remove } = useTransactionMutations({
    onAfterCreate: async () => Promise.all([reloadTransactions(), reloadCategories()]).then(() => undefined),
    onAfterUpdate: async () => Promise.all([reloadTransactions(), reloadCategories()]).then(() => undefined),
    onAfterDelete: async () => reloadTransactions(),
    onErrorMessage: t('status.failedTransaction'),
    onSavedMessage: t('transactions.saved'),
    onUpdatedMessage: t('transactions.updated'),
    onDeletedMessage: t('transactions.deleted'),
  });
  const reportFilter = hasCustomRange ? { from: fromDate, to: toDate } : { month };

  function resetForm(): void {
    setEditingTransactionId(null);
    setForm({
      type: 'expense',
      amount: '',
      occurredOn: `${month}-01`,
      categoryId: '',
      note: '',
    });
  }

  function resetIncomeQuickForm(): void {
    setIncomeQuickForm({
      amount: '',
      occurredOn: `${month}-01`,
      note: 'Monthly income',
    });
  }

  function resetExpenseQuickForm(): void {
    setExpenseQuickForm({
      amount: '',
      occurredOn: `${month}-01`,
      note: '',
      categoryId: '',
    });
  }

  function startEditing(item: Transaction): void {
    setEditingTransactionId(item.id);
    setForm({
      type: item.type,
      amount: String(item.amount),
      occurredOn: item.occurredOn,
      categoryId: item.categoryId ?? '',
      note: item.note ?? '',
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!isFormValid) {
      return;
    }

    if (editingTransactionId) {
      const didUpdate = await update(editingTransactionId, {
        type: form.type as 'income' | 'expense',
        amount: Number(form.amount),
        occurredOn: form.occurredOn,
        categoryId: form.categoryId || undefined,
        note: form.note || undefined,
      });

      if (didUpdate) {
        resetForm();
      }

      return;
    }

    const didCreate = await create({
      type: form.type as 'income' | 'expense',
      amount: Number(form.amount),
      occurredOn: form.occurredOn,
      categoryId: form.categoryId || undefined,
      note: form.note || undefined,
    });

    if (didCreate) {
      resetForm();
    }
  }

  async function handleDelete(id: string): Promise<void> {
    await remove(id);
  }

  async function handleQuickIncomeSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!isIncomeQuickValid) {
      return;
    }

    const incomeCategory = categories.find((category) => category.type === 'income');
    const didCreate = await create({
      type: 'income',
      amount: Number(incomeQuickForm.amount),
      occurredOn: incomeQuickForm.occurredOn,
      categoryId: incomeCategory?.id,
      note: incomeQuickForm.note || 'Monthly income',
    });

    if (didCreate) {
      setIncomeQuickStatus('Monthly income saved. 每月收入已儲存。');
      resetIncomeQuickForm();
    }
  }

  async function handleQuickExpenseSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!isExpenseQuickValid) {
      return;
    }

    const didCreate = await create({
      type: 'expense',
      amount: Number(expenseQuickForm.amount),
      occurredOn: expenseQuickForm.occurredOn,
      categoryId: expenseQuickForm.categoryId || undefined,
      note: expenseQuickForm.note || undefined,
    });

    if (didCreate) {
      setExpenseQuickStatus('Expense saved. 支出已儲存。');
      resetExpenseQuickForm();
    }
  }

  async function handleImport(): Promise<void> {
    if (!parsedImportRows.length || invalidImportRows.length > 0) {
      return;
    }

    setIsImporting(true);
    setImportStatus('');

    try {
      const result = await importTransactions(parsedImportRows);
      await Promise.all([reloadTransactions(), reloadCategories()]);
      setImportCsv('');
      setSelectedImportFileName('');
      setSkippedImportRows(result.skippedRows);
      setImportStatus(
        `${result.imported} ${t('transactions.imported')} ${result.skipped} ${t('transactions.importSkipped')}`,
      );
    } catch (importError) {
      setImportStatus(importError instanceof Error ? importError.message : t('transactions.importFailed'));
    } finally {
      setIsImporting(false);
    }
  }

  async function handleImportFileChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      setImportCsv(text);
      setSelectedImportFileName(file.name);
      setImportStatus('');
    } catch {
      setImportStatus(t('transactions.importFailed'));
    } finally {
      event.target.value = '';
    }
  }

  function clearImportData(): void {
    setImportCsv('');
    setSelectedImportFileName('');
    setImportStatus('');
    setSkippedImportRows([]);
  }

  function getImportIssueLabel(reason: ImportRowIssue['reason']): string {
    if (reason === 'date') {
      return t('transactions.importIssueDate');
    }

    if (reason === 'type') {
      return t('transactions.importIssueType');
    }

    return t('transactions.importIssueAmount');
  }

  async function handleDownloadReport(kind: ReportKind): Promise<void> {
    setActiveReport(kind);
    setReportStatus('');

    try {
      const result =
        kind === 'transactions'
          ? await downloadTransactionsReport(reportFilter)
          : await downloadSummaryReport(reportFilter);
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setReportStatus(t('reports.ready'));
    } catch (downloadError) {
      setReportStatus(downloadError instanceof Error ? downloadError.message : t('reports.failed'));
    } finally {
      setActiveReport(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <Panel title="What do you want to add today? 今天想先記哪一筆？" eyebrow={hasCustomRange ? `${fromDate} → ${toDate}` : month}>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-sm font-medium text-white">Most people start here</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-sm font-medium text-white">Need a label first?</p>
              <div className="mt-3 flex flex-wrap gap-4">
                <Link className="inline-flex text-sm font-semibold text-reef" to="/categories">
                  {t('nav.categories')}
                </Link>
                <Link className="inline-flex text-sm font-semibold text-sand" to="/budgets">
                  {t('nav.budgets')}
                </Link>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Monthly income 每月收入" eyebrow="Fast entry 快速輸入">
          <div className="space-y-4">
            <form className="space-y-4" onSubmit={(event) => void handleQuickIncomeSubmit(event)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  <span className="field-label">{t('transactions.amount')}</span>
                  <input
                    className="text-input"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={incomeQuickForm.amount}
                    onChange={(event) => setIncomeQuickForm((current) => ({ ...current, amount: event.target.value }))}
                  />
                </label>
                <label className="field">
                  <span className="field-label">{t('transactions.occurredOn')}</span>
                  <input
                    className="text-input"
                    type="date"
                    value={incomeQuickForm.occurredOn}
                    onChange={(event) => setIncomeQuickForm((current) => ({ ...current, occurredOn: event.target.value }))}
                  />
                </label>
              </div>
              <label className="field">
                <span className="field-label">{t('transactions.note')}</span>
                <input
                  className="text-input"
                  value={incomeQuickForm.note}
                  onChange={(event) => setIncomeQuickForm((current) => ({ ...current, note: event.target.value }))}
                  placeholder="Salary, freelance, allowance..."
                />
              </label>
              <button className="primary-button w-full" disabled={isSaving || !isIncomeQuickValid} type="submit">
                Save income 記下這筆收入
              </button>
              {incomeQuickStatus ? <p className="text-sm text-white/70">{incomeQuickStatus}</p> : null}
            </form>
          </div>
        </Panel>

        <Panel title="Quick expense 快速記支出" eyebrow="Daily spending 每日支出">
          <div className="space-y-4">
            <form className="space-y-4" onSubmit={(event) => void handleQuickExpenseSubmit(event)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  <span className="field-label">{t('transactions.amount')}</span>
                  <input
                    className="text-input"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={expenseQuickForm.amount}
                    onChange={(event) => setExpenseQuickForm((current) => ({ ...current, amount: event.target.value }))}
                  />
                </label>
                <label className="field">
                  <span className="field-label">{t('transactions.occurredOn')}</span>
                  <input
                    className="text-input"
                    type="date"
                    value={expenseQuickForm.occurredOn}
                    onChange={(event) => setExpenseQuickForm((current) => ({ ...current, occurredOn: event.target.value }))}
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  <span className="field-label">{t('transactions.category')}</span>
                  <select
                    className="text-input"
                    value={expenseQuickForm.categoryId}
                    onChange={(event) => setExpenseQuickForm((current) => ({ ...current, categoryId: event.target.value }))}
                  >
                    <option value="">{t('transactions.uncategorized')}</option>
                    {expenseCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field-label">{t('transactions.note')}</span>
                  <input
                    className="text-input"
                    value={expenseQuickForm.note}
                    onChange={(event) => setExpenseQuickForm((current) => ({ ...current, note: event.target.value }))}
                    placeholder="Coffee, taxi, groceries..."
                  />
                </label>
              </div>
              <button className="primary-button w-full" disabled={isSaving || !isExpenseQuickValid} type="submit">
                Save expense 記下這筆支出
              </button>
              {expenseQuickStatus ? <p className="text-sm text-white/70">{expenseQuickStatus}</p> : null}
            </form>
          </div>
        </Panel>

        <details className="rounded-[28px] border border-white/10 bg-[#132736]/80 px-5 py-5">
          <summary className="cursor-pointer list-none text-base font-semibold text-white">
            More tools 更多工具
            <span className="ml-3 text-sm font-normal text-white/45">Import, export, setup, and advanced entry</span>
          </summary>
          <details className="mt-4 rounded-2xl border border-white/10 bg-black/15 px-4 py-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-white">
              Advanced transaction form 進階交易表單
            </summary>
            <form className="mt-4 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field">
                <span className="field-label">{t('transactions.type')}</span>
                <select
                  className="text-input"
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                >
                  <option value="expense">{t('transactions.type.expense')}</option>
                  <option value="income">{t('transactions.type.income')}</option>
                </select>
              </label>
              <label className="field">
                <span className="field-label">{t('transactions.amount')}</span>
                <input
                  className="text-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field">
                <span className="field-label">{t('transactions.occurredOn')}</span>
                <input
                  className="text-input"
                  type="date"
                  value={form.occurredOn}
                  onChange={(event) => setForm((current) => ({ ...current, occurredOn: event.target.value }))}
                />
              </label>
              <label className="field">
                <span className="field-label">{t('transactions.category')}</span>
                <select
                  className="text-input"
                  value={form.categoryId}
                  onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
                >
                  <option value="">{t('transactions.uncategorized')}</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {availableCategories.length === 0 ? <p className="text-xs text-white/50">{t('transactions.categoryHint')}</p> : null}

            <label className="field">
              <span className="field-label">{t('transactions.note')}</span>
              <input
                className="text-input"
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                placeholder={t('transactions.note.placeholder')}
              />
            </label>

            {!isAmountValid ? <p className="text-sm text-white/55">{t('transactions.amountRequired')}</p> : null}
            <div className="space-y-3">
              <button className="primary-button w-full" disabled={isSaving || !isFormValid} type="submit">
                {isSaving ? t('transactions.saving') : editingTransactionId ? t('transactions.updateButton') : t('transactions.createButton')}
              </button>
              {editingTransactionId ? (
                <button
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                  onClick={resetForm}
                  type="button"
                >
                  {t('transactions.cancelEdit')}
                </button>
              ) : null}
            </div>
            {status ? <p className="text-sm text-white/70">{status}</p> : null}
            {error ? <p className="text-sm text-coral">{error}</p> : null}
            </form>
          </details>

          <details className="mt-4 rounded-2xl border border-white/10 bg-black/15 px-4 py-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-white">
              {t('transactions.import')}
            </summary>
            <div className="mt-4 space-y-4">
            <p className="text-sm leading-7 text-white/65">{t('transactions.importDescription')}</p>
            <p className="text-xs leading-6 text-white/45">{t('transactions.importFormat')}</p>
            <p className="text-xs leading-6 text-white/45">{t('transactions.importPasteHint')}</p>
            <button
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={downloadImportTemplate}
              type="button"
            >
              {t('transactions.downloadTemplate')}
            </button>
            <p className="text-xs leading-6 text-white/45">{t('transactions.templateHint')}</p>
            <label className="field">
              <span className="field-label">{t('transactions.uploadFile')}</span>
              <input
                className="text-input file:mr-4 file:rounded-xl file:border-0 file:bg-reef/15 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-reef"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => void handleImportFileChange(event)}
              />
            </label>
            {selectedImportFileName ? (
              <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4 text-sm text-white/70">
                <p>
                  {t('transactions.selectedFile')}: <span className="text-white">{selectedImportFileName}</span>
                </p>
              </div>
            ) : null}
            <label className="field">
              <span className="field-label">CSV preview</span>
              <textarea
                className="text-input min-h-[180px]"
                value={importCsv}
                onChange={(event) => {
                  setImportCsv(event.target.value);
                  setSelectedImportFileName('');
                }}
                placeholder={t('transactions.importPlaceholder')}
              />
            </label>
            <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4 text-sm text-white/70">
              <p>
                {t('transactions.importPreview')}: {parsedImportRows.length} {t('transactions.importRows')}
              </p>
              {parsedImportRows.slice(0, 3).map((row, index) => (
                <p key={`${row.occurredOn}-${row.amount}-${index}`} className="mt-2 text-xs leading-6 text-white/50">
                  {row.occurredOn} · {row.type} · {formatCurrency(row.amount)} · {row.categoryName || t('transactions.uncategorized')}
                </p>
              ))}
            </div>
            {invalidImportRows.length > 0 ? (
              <div className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-4 text-sm text-coral">
                <p>
                  {invalidImportRows.length} {t('transactions.importInvalidRows')}
                </p>
                <p className="mt-2 text-xs leading-6 text-coral/90">{t('transactions.importFixHint')}</p>
                {invalidImportRows.slice(0, 5).map((issue) => (
                  <p key={`${issue.lineNumber}-${issue.raw}`} className="mt-2 text-xs leading-6">
                    {t('transactions.importLine')} {issue.lineNumber}: {getImportIssueLabel(issue.reason)}
                    <br />
                    {t('transactions.importRawRow')}: {issue.raw}
                  </p>
                ))}
                {invalidImportRows.length > 5 ? (
                  <p className="mt-3 text-xs leading-6 text-coral/90">{t('transactions.importMoreIssues')}</p>
                ) : null}
              </div>
            ) : null}
            <button
              className="primary-button w-full"
              disabled={isImporting || parsedImportRows.length === 0 || invalidImportRows.length > 0}
              onClick={() => void handleImport()}
              type="button"
            >
              {isImporting ? t('transactions.importing') : t('transactions.importButton')}
            </button>
            <button
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              disabled={!importCsv && !selectedImportFileName}
              onClick={clearImportData}
              type="button"
            >
              {t('transactions.clearImport')}
            </button>
            {importStatus ? <p className="text-sm text-white/70">{importStatus}</p> : null}
            {skippedImportRows.length > 0 ? (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm text-amber-100">
                <p>
                  {t('transactions.importSkippedList')}: {skippedImportRows.length}
                </p>
                {skippedImportRows.slice(0, 5).map((row, index) => (
                  <p
                    key={`${row.occurredOn}-${row.type}-${row.amount}-${row.categoryName ?? 'uncategorized'}-${index}`}
                    className="mt-2 text-xs leading-6 text-amber-100/85"
                  >
                    {row.occurredOn} · {row.type} · {formatCurrency(row.amount)} · {row.categoryName || t('transactions.uncategorized')}
                    {row.note ? ` · ${row.note}` : ''}
                  </p>
                ))}
                {skippedImportRows.length > 5 ? (
                  <p className="mt-3 text-xs leading-6 text-amber-100/80">{t('transactions.importSkippedMore')}</p>
                ) : null}
              </div>
            ) : null}
            </div>
          </details>

          <details className="mt-4 rounded-2xl border border-white/10 bg-black/15 px-4 py-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-white">
              {t('reports.title')}
            </summary>
            <div className="mt-4 space-y-4">
            <p className="text-sm leading-7 text-white/65">
              Download your data from the same place where you add and import transactions, so exporting stays simple.
            </p>
            <button
              className="primary-button w-full"
              disabled={activeReport !== null}
              onClick={() => void handleDownloadReport('transactions')}
              type="button"
            >
              {activeReport === 'transactions' ? 'Downloading...' : `${t('reports.transactions')} CSV`}
            </button>
            <button
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              disabled={activeReport !== null}
              onClick={() => void handleDownloadReport('summary')}
              type="button"
            >
              {activeReport === 'summary' ? 'Downloading...' : `${t('reports.summary')} CSV`}
            </button>
            {reportStatus ? <p className="text-sm text-white/70">{reportStatus}</p> : null}
            </div>
          </details>

          <details className="mt-4 rounded-2xl border border-white/10 bg-black/15 px-4 py-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-white">
              Setup tools 設定工具
            </summary>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-sm font-medium text-white">{t('nav.categories')}</p>
              <p className="mt-2 text-sm leading-7 text-white/60">Create a few clean labels first if your transactions need clearer grouping.</p>
              <Link className="mt-3 inline-flex text-sm font-semibold text-reef" to="/categories">
                Open categories
              </Link>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-sm font-medium text-white">{t('nav.budgets')}</p>
              <p className="mt-2 text-sm leading-7 text-white/60">Only use budgets if you want stricter monthly control. It is not required to start using the app.</p>
              <Link className="mt-3 inline-flex text-sm font-semibold text-sand" to="/budgets">
                Open budgets
              </Link>
            </div>
            </div>
          </details>
        </details>
      </div>

      <Panel title={t('transactions.list')} eyebrow={hasCustomRange ? `${fromDate} → ${toDate}` : month}>
        {isLoading ? <p className="text-sm text-white/55">{t('common.loading')}</p> : null}
        <div className="space-y-3">
          {transactions.slice(0, 10).map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">{item.note || item.categoryName || item.type}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">
                    {item.occurredOn} · {item.categoryName || t('transactions.uncategorized')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className={item.type === 'income' ? 'text-reef' : 'text-coral'}>{formatCurrency(item.amount)}</p>
                  <button
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
                    onClick={() => startEditing(item)}
                    type="button"
                  >
                    {t('transactions.edit')}
                  </button>
                  <button className="danger-button" onClick={() => void handleDelete(item.id)} type="button">
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </article>
          ))}
          {transactions.length > 10 ? (
            <p className="text-sm text-white/55">
              Showing the latest 10 items. Use the date filter when you want to focus on another period.
            </p>
          ) : null}
          {transactions.length === 0 && !isLoading ? <p className="text-sm text-white/55">{t('transactions.empty')}</p> : null}
        </div>
      </Panel>
    </div>
  );
}
