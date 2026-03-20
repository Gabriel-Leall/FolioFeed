import * as React from "react";
import { cn } from "@PeerFolio/ui/lib/utils";

interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export function CharacterCounter({ current, max, className }: CharacterCounterProps) {
  const percentage = current / max;
  const show = percentage >= 0.8;
  const isAtLimit = percentage >= 1;

  if (!show) {
    return null;
  }

  return (
    <div
      className={cn(
        "text-xs mt-1 text-right transition-colors",
        isAtLimit ? "text-destructive font-medium" : "text-muted-foreground",
        className
      )}
      aria-live="polite"
    >
      {current} / {max} characters
    </div>
  );
}
