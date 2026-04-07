import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { Panel } from '../components/Panel';
import { downloadSummaryReport, downloadTransactionsReport } from '../lib/api';
import { usePreferences } from '../providers/PreferencesProvider';

interface ShellContext {
  month: string;
}

type ReportKind = 'transactions' | 'summary';

export function ReportsPage(): JSX.Element {
  const { month } = useOutletContext<ShellContext>();
  const { t } = usePreferences();
  const [status, setStatus] = useState<string>('');
  const [activeReport, setActiveReport] = useState<ReportKind | null>(null);

  async function handleDownload(kind: ReportKind): Promise<void> {
    setActiveReport(kind);
    setStatus('');

    try {
      const result =
        kind === 'transactions'
          ? await downloadTransactionsReport(month)
          : await downloadSummaryReport(month);
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus(t('reports.ready'));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t('reports.failed'));
    } finally {
      setActiveReport(null);
    }
  }

  return (
    <>
      <section className="glass-panel overflow-hidden">
        <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-reef">{t('reports.title')}</p>
            <h2 className="mt-4 text-5xl leading-none">{t('reports.title')}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">{t('reports.description')}</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-black/15 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">{t('shell.month')}</p>
            <p className="mt-4 text-3xl text-sand">{month}</p>
            <p className="mt-4 text-sm leading-7 text-white/60">{t('reports.hint')}</p>
          </div>
        </div>
      </section>

      {status ? (
        <div
          className={`rounded-3xl px-5 py-4 text-sm ${
            status === t('reports.ready')
              ? 'border border-reef/30 bg-reef/10 text-reef'
              : 'border border-coral/30 bg-coral/10 text-coral'
          }`}
        >
          {status}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title={t('reports.transactions')} eyebrow="CSV / Excel">
          <p className="text-sm leading-7 text-white/65">
            Export every transaction for the selected month with date, type, category, amount, and note.
          </p>
          <button
            className="primary-button mt-6 w-full"
            disabled={activeReport !== null}
            onClick={() => void handleDownload('transactions')}
            type="button"
          >
            {activeReport === 'transactions' ? 'Downloading...' : `${t('reports.download')} CSV`}
          </button>
        </Panel>

        <Panel title={t('reports.summary')} eyebrow="CSV / Excel">
          <p className="text-sm leading-7 text-white/65">
            Export this month&apos;s income, expense, balance, savings target, and budget-vs-actual summary.
          </p>
          <button
            className="primary-button mt-6 w-full"
            disabled={activeReport !== null}
            onClick={() => void handleDownload('summary')}
            type="button"
          >
            {activeReport === 'summary' ? 'Downloading...' : `${t('reports.download')} CSV`}
          </button>
        </Panel>
      </section>
    </>
  );
}
