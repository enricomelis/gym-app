"use client";

import { useMemo, useState } from "react";

import { CdpElementoDialog } from "@/components/cdp/cdp-elemento-dialog";
import { CdpElementPreview } from "@/components/cdp/cdp-element-preview";
import {
  COLORI_GRUPPO,
  NUMERI_ROMANI,
  coloreDifficolta,
  etichettaDifficolta,
  troncaTesto,
} from "@/components/cdp/cdp-constants";
import type { ResolvedExerciseElement } from "@/lib/types/exercise";
import { cn } from "@/lib/utils";

interface ExerciseElementsListProps {
  elements: ResolvedExerciseElement[];
}

function displayName(el: { nome: string; descrizione: string }) {
  if (el.nome) return el.nome;
  return troncaTesto(el.descrizione, 50);
}

export function ExerciseElementsList({ elements }: ExerciseElementsListProps) {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const selectedElement =
    elements.find((item) => item.elementId === selectedElementId)?.element ?? null;

  const difficultySummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of elements) {
      const val = item.element.valore;
      counts.set(val, (counts.get(val) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [elements]);

  return (
    <>
      {difficultySummary.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {difficultySummary.map(([valore, count]) => (
            <span
              key={valore}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
                coloreDifficolta(valore),
              )}
            >
              {count}&times;{etichettaDifficolta(valore)}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-0.5">
        {elements.map((item) => {
          const label = displayName(item.element);

          return (
            <button
              key={`${item.elementId}-${item.order}`}
              type="button"
              onClick={() => setSelectedElementId(item.elementId)}
              className="hover:bg-accent/30 flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors"
              style={{
                borderLeft: `3px solid ${COLORI_GRUPPO[item.element.gruppo.numero]}`,
              }}
            >
              <span className="text-muted-foreground w-5 shrink-0 font-mono text-xs">
                {item.order}.
              </span>
              <CdpElementPreview element={item.element} size="xs" />
              <span className="min-w-0 flex-1 truncate text-sm font-bold">{label}</span>
              <div className="flex shrink-0 items-center gap-1">
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{
                    backgroundColor: COLORI_GRUPPO[item.element.gruppo.numero],
                    color: "#000",
                  }}
                >
                  {NUMERI_ROMANI[item.element.gruppo.numero]}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                    coloreDifficolta(item.element.valore),
                  )}
                >
                  {etichettaDifficolta(item.element.valore)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <CdpElementoDialog elemento={selectedElement} onClose={() => setSelectedElementId(null)} />
    </>
  );
}
