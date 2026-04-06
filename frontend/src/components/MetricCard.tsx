interface MetricCardProps {
  label: string;
  value: string;
  tone?: 'positive' | 'neutral' | 'warning';
}

export function MetricCard({ label, value, tone = 'neutral' }: MetricCardProps): JSX.Element {
  const accent =
    tone === 'positive' ? 'text-reef' : tone === 'warning' ? 'text-coral' : 'text-sand';

  return (
    <div className="glass-panel p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-white/50">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
