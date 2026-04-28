import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import en from "./locales/en.json";

/**
 * Lightweight i18n shim. Same call signature as react-i18next's `t(key, opts)`
 * with a `defaultValue` fallback. Drops in cleanly later if we adopt
 * react-i18next; for now keeps the bundle and the API surface tiny.
 */
type Dict = Record<string, unknown>;
const resources: Record<string, Dict> = { en: en as Dict };

function lookup(dict: Dict, key: string): string | undefined {
  const parts = key.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Dict)) {
      cur = (cur as Dict)[p];
    } else return undefined;
  }
  return typeof cur === "string" ? cur : undefined;
}

interface Ctx {
  locale: string;
  setLocale: (l: string) => void;
  t: (key: string, opts?: { defaultValue?: string } & Record<string, string | number>) => string;
}
const I18nContext = createContext<Ctx | null>(null);

export function SettingsI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<string>(() => {
    if (typeof window === "undefined") return "en";
    return window.localStorage.getItem("ewa.locale") || "en";
  });

  const value = useMemo<Ctx>(() => {
    const dict = resources[locale] ?? resources.en;
    const t = (key: string, opts?: { defaultValue?: string } & Record<string, string | number>) => {
      const found = lookup(dict, key) ?? opts?.defaultValue ?? key;
      if (!opts) return found;
      return found.replace(/\{\{(\w+)\}\}/g, (_, k) => String(opts[k] ?? `{{${k}}}`));
    };
    return {
      locale,
      setLocale: (l: string) => {
        setLocale(l);
        if (typeof window !== "undefined") window.localStorage.setItem("ewa.locale", l);
      },
      t,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback: works even outside provider so subpages don't crash if mounted bare.
    return {
      t: (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key,
      locale: "en",
      setLocale: () => {},
    };
  }
  return ctx;
}
