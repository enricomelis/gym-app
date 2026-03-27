"use client";

import { useState } from "react";

import { CdpElementoDialog } from "@/components/cdp/cdp-elemento-dialog";
import { CdpElementPreview } from "@/components/cdp/cdp-element-preview";
import {
  COLORI_GRUPPO,
  NUMERI_ROMANI,
  coloreDifficolta,
  etichettaDifficolta,
  titoloElemento,
} from "@/components/cdp/cdp-constants";
import type { ResolvedExerciseElement } from "@/lib/types/exercise";
import { cn } from "@/lib/utils";

interface ExerciseElementsListProps {
  elements: ResolvedExerciseElement[];
}

export function ExerciseElementsList({ elements }: ExerciseElementsListProps) {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const selectedElement =
    elements.find((item) => item.elementId === selectedElementId)?.element ?? null;

  return (
    <>
      <div className="grid gap-3">
        {elements.map((item) => (
          <button
            key={`${item.elementId}-${item.order}`}
            type="button"
            onClick={() => setSelectedElementId(item.elementId)}
            className="hover:border-primary/40 hover:bg-accent/20 grid gap-3 rounded-xl border p-4 text-left transition-colors"
          >
            <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3">
              <CdpElementPreview element={item.element} />
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground font-mono text-xs">{item.order}.</span>
                  <span
                    className="rounded-full px-2 py-1 text-[11px] font-semibold"
                    style={{
                      backgroundColor: COLORI_GRUPPO[item.element.gruppo.numero],
                      color: "#000",
                    }}
                  >
                    Gruppo {NUMERI_ROMANI[item.element.gruppo.numero]}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold",
                      coloreDifficolta(item.element.valore),
                    )}
                  >
                    {etichettaDifficolta(item.element.valore)}
                  </span>
                  {item.role === "USCITA" && (
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-[11px] font-semibold">
                      Uscita
                    </span>
                  )}
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-semibold">{titoloElemento(item.element)}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {item.element.id} · {item.element.descrizione}
                  </p>
                </div>
              </div>
              <span className="text-muted-foreground text-xs">Apri dettaglio</span>
            </div>
          </button>
        ))}
      </div>

      <CdpElementoDialog elemento={selectedElement} onClose={() => setSelectedElementId(null)} />
    </>
  );
}
