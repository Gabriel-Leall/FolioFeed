"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  DEFAULT_LOCALE,
  type AppLocale,
  SUPPORTED_LOCALES,
} from "./messages";
import { i18n } from "./client";

const STORAGE_KEY = "foliofeed.locale";
const COOKIE_KEY = "foliofeed-locale";

type TranslateOptions = {
  values?: Record<string, string | number>;
  count?: number;
};

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: string, options?: TranslateOptions) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const isValidLocale = (value: string | null): value is AppLocale =>
  !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { t: i18nT } = useTranslation();
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (isValidLocale(fromStorage)) {
      setLocaleState(fromStorage);
      return;
    }

    const cookieValue =
      document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${COOKIE_KEY}=`))
      ?.split("=")[1] ?? null;

    if (isValidLocale(cookieValue)) {
      setLocaleState(cookieValue);
    }
  }, []);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    localStorage.setItem(STORAGE_KEY, nextLocale);
    document.cookie = `${COOKIE_KEY}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = nextLocale === "pt-BR" ? "pt-BR" : "en";
    void i18n.changeLanguage(nextLocale);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "pt-BR" ? "pt-BR" : "en";
    void i18n.changeLanguage(locale);
  }, [locale]);

  const t = useCallback(
    (key: string, options?: TranslateOptions) => {
      const values = {
        ...(options?.values ?? {}),
        ...(typeof options?.count === "number" ? { count: options.count } : {}),
      };

      return String(i18nT(key, values));
    },
    [i18nT],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}
