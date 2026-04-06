import type { PropsWithChildren, ReactNode } from 'react';

interface PanelProps extends PropsWithChildren {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}

export function Panel({ title, eyebrow, action, children }: PanelProps): JSX.Element {
  return (
    <section className="glass-panel overflow-hidden">
      <header className="flex flex-col gap-3 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {eyebrow ? <p className="text-xs uppercase tracking-[0.22em] text-reef">{eyebrow}</p> : null}
          <h2 className="section-heading mt-2">{title}</h2>
        </div>
        {action}
      </header>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}
