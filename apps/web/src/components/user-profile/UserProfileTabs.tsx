import { BookOpen, MessageSquare } from "lucide-react";

import { cn } from "@PeerFolio/ui/lib/utils";

import type { UserProfileTab } from "./types";

type UserProfileTabsProps = {
  activeTab: UserProfileTab;
  onTabChange: (tab: UserProfileTab) => void;
  portfoliosCount: number;
  critiquesCount: number;
};

export function UserProfileTabs({
  activeTab,
  onTabChange,
  portfoliosCount,
  critiquesCount,
}: UserProfileTabsProps) {
  return (
    <div className="flex gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-low p-1">
      <button
        type="button"
        onClick={() => onTabChange("portfolios")}
        className={cn(
          "inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
          activeTab === "portfolios"
            ? "bg-primary/15 text-primary"
            : "text-on-surface-variant hover:bg-surface-container"
        )}
      >
        <BookOpen className="h-4 w-4" />
        Portfólios
        <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs">
          {portfoliosCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("critiques")}
        className={cn(
          "inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
          activeTab === "critiques"
            ? "bg-primary/15 text-primary"
            : "text-on-surface-variant hover:bg-surface-container"
        )}
      >
        <MessageSquare className="h-4 w-4" />
        Críticas
        <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs">
          {critiquesCount}
        </span>
      </button>
    </div>
  );
}
