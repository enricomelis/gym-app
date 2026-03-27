"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { CdpElementoDialog } from "@/components/cdp/cdp-elemento-dialog";
import { CdpElementPreview } from "@/components/cdp/cdp-element-preview";
import {
  COLORI_GRUPPO,
  NUMERI_ROMANI,
  coloreDifficolta,
  etichettaDifficolta,
  ordinaDifficolta,
  titoloElemento,
} from "@/components/cdp/cdp-constants";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import type { ElementoCdp } from "@/lib/types/cdp";
import { cn } from "@/lib/utils";

type CatalogView = "tabella" | "difficolta";

interface ExerciseCatalogProps {
  elements: ElementoCdp[];
  onAddElement: (elementId: string) => void;
  addDisabled?: boolean;
}

function ExerciseCatalogItem({
  element,
  onOpen,
  onAdd,
  addDisabled,
  compact = false,
  dense = false,
}: {
  element: ElementoCdp;
  onOpen: () => void;
  onAdd: () => void;
  addDisabled?: boolean;
  compact?: boolean;
  dense?: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "hover:border-primary/40 hover:bg-accent/30 grid w-full gap-3 rounded-xl border p-3 text-left transition-colors",
        compact
          ? "grid-cols-[minmax(0,1fr)_auto] items-start"
          : dense
            ? "aspect-square grid-rows-[auto_1fr_auto] p-2.5"
            : "aspect-square grid-rows-[auto_1fr_auto]",
      )}
    >
      <div className={cn("grid min-w-0 gap-3", dense && "gap-2")}>
        <div className="flex flex-wrap items-center gap-2 self-start">
          <span
            className="rounded-full px-2 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: COLORI_GRUPPO[element.gruppo.numero], color: "#000" }}
          >
            Gruppo {NUMERI_ROMANI[element.gruppo.numero]}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold",
              coloreDifficolta(element.valore),
            )}
          >
            {etichettaDifficolta(element.valore)}
          </span>
        </div>
        <div className="grid min-w-0 content-start gap-1 self-start">
          <p
            className={cn(
              "line-clamp-3 font-semibold leading-snug break-words",
              dense ? "text-[13px]" : "text-sm",
            )}
          >
            {titoloElemento(element)}
          </p>
          <p className={cn("text-muted-foreground font-mono", dense ? "text-[10px]" : "text-xs")}>
            {element.id}
          </p>
          <p
            className={cn(
              "text-muted-foreground line-clamp-2 leading-relaxed break-words",
              dense ? "text-[10px]" : "text-[11px]",
            )}
          >
            {element.descrizione}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "grid gap-3",
          compact
            ? "justify-items-end self-stretch"
            : "grid-cols-[1fr_auto] items-end self-end gap-2",
        )}
      >
        <div className={cn(compact ? "" : "justify-self-end")}>
          <CdpElementPreview element={element} size="xs" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={addDisabled}
            onClick={(event) => {
              event.stopPropagation();
              onAdd();
            }}
            className={buttonVariants({ size: dense ? "xs" : "sm" })}
          >
            <Plus className="size-4" />
            Aggiungi
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExerciseCatalog({ elements, onAddElement, addDisabled }: ExerciseCatalogProps) {
  const [view, setView] = useState<CatalogView>("tabella");
  const [query, setQuery] = useState("");
  const [selectedElement, setSelectedElement] = useState<ElementoCdp | null>(null);

  const filteredElements = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return elements;
    }

    return elements.filter((element) =>
      [element.id, element.nome, element.descrizione, element.valore]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [elements, query]);

  const groupedByGroup = useMemo(() => {
    const grouped = new Map<number, ElementoCdp[]>();
    for (const element of filteredElements) {
      const groupElements = grouped.get(element.gruppo.numero) ?? [];
      groupElements.push(element);
      grouped.set(element.gruppo.numero, groupElements);
    }

    return [...grouped.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([groupNumber, groupElements]) => ({
        groupNumber,
        groupName: groupElements[0]?.gruppo.nome ?? "",
        elements: groupElements.sort((a, b) => a.numero - b.numero),
      }));
  }, [filteredElements]);

  const groupedByDifficulty = useMemo(() => {
    const grouped = new Map<string, ElementoCdp[]>();
    for (const element of filteredElements) {
      const difficultyElements = grouped.get(element.valore) ?? [];
      difficultyElements.push(element);
      grouped.set(element.valore, difficultyElements);
    }

    return ordinaDifficolta([...grouped.keys()]).map((difficulty) => ({
      difficulty,
      elements:
        grouped.get(difficulty)?.sort((a, b) => {
          if (a.gruppo.numero !== b.gruppo.numero) {
            return a.gruppo.numero - b.gruppo.numero;
          }
          return a.numero - b.numero;
        }) ?? [],
    }));
  }, [filteredElements]);

  return (
    <>
      <div className="grid gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca per codice, nome o descrizione"
            className="max-w-xl"
          />
          <select
            aria-label="Vista catalogo"
            value={view}
            onChange={(event) => setView(event.target.value as CatalogView)}
            className="border-input bg-background h-8 min-w-40 rounded-lg border px-3 text-sm"
          >
            <option value="tabella">Tabella</option>
            <option value="difficolta">Difficoltà</option>
          </select>
        </div>

        {view === "tabella" ? (
          <div className="grid gap-6">
            {groupedByGroup.map((group) => (
              <section key={group.groupNumber} className="grid gap-3">
                <div
                  className="rounded-lg px-3 py-2 text-sm font-semibold"
                  style={{
                    backgroundColor: COLORI_GRUPPO[group.groupNumber],
                    color: "#000",
                  }}
                >
                  Gruppo {NUMERI_ROMANI[group.groupNumber]} · {group.groupName}
                </div>
                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {group.elements.map((element) => (
                    <ExerciseCatalogItem
                      key={element.id}
                      element={element}
                      dense
                      addDisabled={addDisabled}
                      onOpen={() => setSelectedElement(element)}
                      onAdd={() => onAddElement(element.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {groupedByDifficulty.map((section) => (
              <section key={section.difficulty} className="grid gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex size-10 items-center justify-center rounded-lg text-lg font-bold",
                      coloreDifficolta(section.difficulty),
                    )}
                  >
                    {etichettaDifficolta(section.difficulty)}
                  </span>
                  <div>
                    <p className="font-semibold">
                      Difficoltà {etichettaDifficolta(section.difficulty)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {section.elements.length} element{section.elements.length === 1 ? "o" : "i"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3">
                  {section.elements.map((element) => (
                    <ExerciseCatalogItem
                      key={element.id}
                      element={element}
                      compact
                      addDisabled={addDisabled}
                      onOpen={() => setSelectedElement(element)}
                      onAdd={() => onAddElement(element.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <CdpElementoDialog elemento={selectedElement} onClose={() => setSelectedElement(null)} />
    </>
  );
}
