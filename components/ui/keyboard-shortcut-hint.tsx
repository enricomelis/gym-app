"use client";

import { cn } from "@/lib/utils";

interface KeyboardShortcutHintProps {
  keys: string[];
  className?: string;
}

export function KeyboardShortcutHint({ keys, className }: KeyboardShortcutHintProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-hidden="true">
      {keys.map((key) => (
        <kbd
          key={key}
          className="bg-muted text-muted-foreground inline-flex min-w-5 items-center justify-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold shadow-xs"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
