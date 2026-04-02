"use client";

import { Button } from "@PeerFolio/ui/components/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useI18n } from "@/i18n/provider";

export function ModeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { t } = useI18n();
  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={isDark ? t("modeToggle.toLight") : t("modeToggle.toDark")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="border-outline/70 bg-surface-container/70 text-on-surface hover:bg-surface-container-high"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">{t("modeToggle.sr")}</span>
    </Button>
  );
}
