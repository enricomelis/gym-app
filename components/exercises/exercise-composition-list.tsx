"use client";

import { useMemo } from "react";
import { ArrowDown, ArrowRightFromLine, ArrowUp, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  COLORI_GRUPPO,
  NUMERI_ROMANI,
  coloreDifficolta,
  etichettaDifficolta,
  troncaTesto,
} from "@/components/cdp/cdp-constants";
import type { Attrezzo } from "@/lib/types/cdp";
import type { ResolvedExerciseElement } from "@/lib/types/exercise";
import { cn } from "@/lib/utils";

interface ExerciseCompositionListProps {
  attrezzo: Attrezzo;
  resolvedElements: ResolvedExerciseElement[];
  maxSlots: number;
  onSelectElement: (elementId: string) => void;
  onMoveElement: (index: number, direction: -1 | 1) => void;
  onRemoveElement: (index: number) => void;
  onMarkExit: (index: number) => void;
}

function displayName(el: { nome: string; descrizione: string }) {
  if (el.nome) return el.nome;
  return troncaTesto(el.descrizione, 40);
}

export function ExerciseCompositionList({
  attrezzo,
  resolvedElements,
  maxSlots,
  onSelectElement,
  onMoveElement,
  onRemoveElement,
  onMarkExit,
}: ExerciseCompositionListProps) {
  const difficultySummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of resolvedElements) {
      const val = item.element.valore;
      counts.set(val, (counts.get(val) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [resolvedElements]);

  const slots = Array.from({ length: maxSlots }, (_, i) => resolvedElements[i] ?? null);
  const isVT = attrezzo === "VT";

  return (
    <div className="grid gap-3">
      <div className="grid gap-0.5">
        {slots.map((item, index) => {
          if (!item) {
            return (
              <div
                key={index}
                className="bg-muted/30 flex h-9 items-center rounded-md border border-dashed px-3"
              >
                <span className="text-muted-foreground font-mono text-xs">{index + 1}.</span>
              </div>
            );
          }

          const label = displayName(item.element);

          return (
            <div
              key={`${item.elementId}-${item.order}`}
              className="group/slot flex items-center gap-2 rounded-md border px-2 py-1.5"
              style={{
                borderLeftColor: COLORI_GRUPPO[item.element.gruppo.numero],
                borderLeftWidth: 3,
              }}
            >
              <span className="text-muted-foreground w-5 shrink-0 font-mono text-xs">
                {item.order}.
              </span>

              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left text-sm font-bold"
                onClick={() => onSelectElement(item.elementId)}
                title={item.element.nome || item.element.descrizione}
              >
                {label}
              </button>

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
                {item.role === "USCITA" && (
                  <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                    U
                  </span>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/slot:opacity-100">
                {!isVT && item.role !== "USCITA" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onMarkExit(index)}
                    title="Segna come uscita"
                    aria-label={`Segna uscita ${label}`}
                  >
                    <ArrowRightFromLine className="size-3" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onMoveElement(index, -1)}
                  disabled={index === 0}
                  title="Sposta su"
                  aria-label={`Sposta su ${label}`}
                >
                  <ArrowUp className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onMoveElement(index, 1)}
                  disabled={index === resolvedElements.length - 1}
                  title="Sposta giù"
                  aria-label={`Sposta giù ${label}`}
                >
                  <ArrowDown className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-xs"
                  onClick={() => onRemoveElement(index)}
                  title="Rimuovi"
                  aria-label={`Rimuovi ${label}`}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {difficultySummary.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
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
    </div>
  );
}
