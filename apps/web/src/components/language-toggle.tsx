"use client";

import { Button } from "@PeerFolio/ui/components/button";

import { type AppLocale, DEFAULT_LOCALE } from "@/i18n/messages";
import { useI18n } from "@/i18n/provider";

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  const nextLocale: AppLocale = locale === "pt-BR" ? "en" : DEFAULT_LOCALE;

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={t("language.switch.aria")}
      onClick={() => setLocale(nextLocale)}
      className="h-9 border-outline/70 bg-surface-container/70 px-3 text-xs font-semibold text-on-surface hover:bg-surface-container-high"
    >
      {locale === "pt-BR" ? t("language.switch.en") : t("language.switch.pt")}
    </Button>
  );
}
