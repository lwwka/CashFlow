import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { dictionaries, type Locale, type TranslationKey } from '../lib/i18n';

type Theme = 'dark' | 'light';

interface PreferencesContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: TranslationKey) => string;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: PropsWithChildren): JSX.Element {
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('cashflow-locale') as Locale) || 'zh');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('cashflow-theme') as Theme) || 'dark');

  useEffect(() => {
    localStorage.setItem('cashflow-locale', locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('cashflow-theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      locale,
      setLocale,
      theme,
      setTheme,
      t: (key) => dictionaries[locale][key],
    }),
    [locale, theme],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }

  return context;
}
