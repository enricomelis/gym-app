"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";

import { CdpElementoDialog } from "@/components/cdp/cdp-elemento-dialog";
import { CdpElementPreview } from "@/components/cdp/cdp-element-preview";
import {
  COLONNE_PDF,
  COLORI_GRUPPO,
  NUMERI_ROMANI,
  coloreDifficolta,
  etichettaDifficolta,
  ordinaDifficolta,
  svgPathElemento,
  titoloElemento,
  troncaTesto,
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
}: {
  element: ElementoCdp;
  onOpen: () => void;
  onAdd: () => void;
  addDisabled?: boolean;
  compact?: boolean;
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
          : "aspect-square grid-rows-[auto_1fr_auto]",
      )}
    >
      <div className={cn("grid min-w-0 gap-3")}>
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
          <p className="line-clamp-3 text-sm font-semibold leading-snug break-words">
            {titoloElemento(element)}
          </p>
          <p className="text-muted-foreground font-mono text-xs">{element.id}</p>
          <p className="text-muted-foreground line-clamp-2 text-[11px] leading-relaxed break-words">
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
            className={buttonVariants({ size: "sm" })}
          >
            <Plus className="size-4" />
            Aggiungi
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * CdP PDF-style grid for the "tabella" view.
 * 6 columns (A-F+), elements positioned by `numero`, empty slots rendered as muted cells.
 */
function CatalogPdfGrid({
  elements,
  onAddElement,
  onSelectElement,
  addDisabled,
}: {
  elements: ElementoCdp[];
  onAddElement: (elementId: string) => void;
  onSelectElement: (el: ElementoCdp) => void;
  addDisabled?: boolean;
}) {
  const gruppiPresenti = useMemo(() => {
    const set = new Set<number>();
    for (const el of elements) set.add(el.gruppo.numero);
    return [...set].sort((a, b) => a - b);
  }, [elements]);

  const datiPerGruppo = useMemo(() => {
    return gruppiPresenti
      .map((g) => {
        const elementiGruppo = elements.filter((el) => el.gruppo.numero === g);
        if (elementiGruppo.length === 0) return null;

        const nomeGruppo = elementiGruppo[0].gruppo.nome;
        const maxNumero = Math.max(...elementiGruppo.map((el) => el.numero));
        const maxRow = Math.floor((maxNumero - 1) / 6);

        const griglia: (ElementoCdp | null)[][] = [];
        for (let r = 0; r <= maxRow; r++) {
          griglia.push([null, null, null, null, null, null]);
        }

        for (const el of elementiGruppo) {
          const riga = Math.floor((el.numero - 1) / 6);
          const colonna = (el.numero - 1) % 6;
          if (riga <= maxRow && colonna < 6) {
            griglia[riga][colonna] = el;
          }
        }

        return { gruppo: g, nomeGruppo, griglia };
      })
      .filter(Boolean) as {
      gruppo: number;
      nomeGruppo: string;
      griglia: (ElementoCdp | null)[][];
    }[];
  }, [elements, gruppiPresenti]);

  if (datiPerGruppo.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center">
        <p className="text-muted-foreground text-sm">Nessun elemento trovato.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {datiPerGruppo.map((dati) => (
        <div key={dati.gruppo} className="grid gap-0">
          {/* Group header */}
          <div
            className="rounded-t-lg px-3 py-2 text-sm font-bold"
            style={{
              backgroundColor: COLORI_GRUPPO[dati.gruppo],
              color: "#000",
            }}
          >
            Gruppo {NUMERI_ROMANI[dati.gruppo]} &middot; {dati.nomeGruppo}
          </div>

          {/* Grid */}
          <div className="overflow-hidden rounded-b-lg border">
            {/* Column headers */}
            <div className="grid grid-cols-6 border-b">
              {COLONNE_PDF.map((col) => (
                <div
                  key={col}
                  className="text-muted-foreground px-1 py-1.5 text-center text-xs font-semibold"
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Rows */}
            {dati.griglia.map((riga, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-6 border-b last:border-b-0">
                {riga.map((el, colIdx) => {
                  if (!el) {
                    return (
                      <div
                        key={colIdx}
                        className="bg-muted/30 aspect-square border-r last:border-r-0"
                      />
                    );
                  }

                  const titolo = titoloElemento(el);
                  const isVT = el.attrezzo === "VT";
                  const mostraBadge = isVT || (colIdx === 5 && el.valore !== "F");
                  const svgPath = svgPathElemento(el.id);

                  return (
                    <div
                      key={colIdx}
                      className="group/cell flex aspect-square cursor-pointer flex-col border-r p-1.5 transition-colors last:border-r-0 hover:bg-accent/30"
                      onClick={() => onSelectElement(el)}
                      title={titolo}
                    >
                      {/* Header: number + difficulty badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {el.numero}
                        </span>
                        {mostraBadge && (
                          <span
                            className={cn(
                              "inline-flex items-center rounded px-1 py-0.5 text-[10px] font-bold",
                              coloreDifficolta(el.valore),
                            )}
                          >
                            {etichettaDifficolta(el.valore)}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <span className="text-foreground line-clamp-2 text-[10px] leading-tight">
                        {troncaTesto(titolo, 40)}
                      </span>

                      {/* SVG or placeholder */}
                      <div className="mt-auto flex items-end justify-between">
                        <div className="flex flex-1 items-end justify-center">
                          {svgPath ? (
                            <Image
                              src={svgPath}
                              alt=""
                              aria-hidden="true"
                              width={36}
                              height={36}
                              unoptimized
                              className="max-h-9 w-auto object-contain"
                            />
                          ) : (
                            <div className="bg-muted/50 size-6 rounded border border-dashed" />
                          )}
                        </div>

                        {/* Add button - visible on hover */}
                        <button
                          type="button"
                          disabled={addDisabled}
                          onClick={(event) => {
                            event.stopPropagation();
                            onAddElement(el.id);
                          }}
                          className={cn(
                            buttonVariants({ size: "icon-xs" }),
                            "opacity-0 transition-opacity group-hover/cell:opacity-100",
                          )}
                          aria-label={`Aggiungi ${titolo}`}
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-inherit dark:bg-yellow-800">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function CatalogSearchDropdown({
  elements,
  query,
  activeIndex,
  onAddElement,
  onSelectElement,
  addDisabled,
}: {
  elements: ElementoCdp[];
  query: string;
  activeIndex: number;
  onAddElement: (elementId: string) => void;
  onSelectElement: (el: ElementoCdp) => void;
  addDisabled?: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return elements
      .filter((element) =>
        [element.id, element.nome, element.descrizione, element.valore]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
      .slice(0, 20);
  }, [elements, query]);

  if (!query.trim() || results.length === 0) {
    if (query.trim()) {
      return (
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-muted-foreground text-sm">Nessun risultato.</p>
        </div>
      );
    }
    return null;
  }

  const trimmedQuery = query.trim();

  return (
    <div
      ref={listRef}
      className="max-h-80 overflow-y-auto rounded-lg border border-border bg-background"
    >
      {results.map((el, idx) => (
        <div
          key={el.id}
          data-index={idx}
          className={cn(
            "flex items-center gap-3 border-b px-3 py-2 last:border-b-0",
            idx === activeIndex ? "bg-accent" : "hover:bg-accent/40",
          )}
        >
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            onClick={() => onSelectElement(el)}
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: COLORI_GRUPPO[el.gruppo.numero] }}
            />
            <span className="text-muted-foreground shrink-0 font-mono text-xs">
              <HighlightMatch text={el.id} query={trimmedQuery} />
            </span>
            <span className="min-w-0 truncate text-sm">
              <HighlightMatch text={titoloElemento(el)} query={trimmedQuery} />
            </span>
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                coloreDifficolta(el.valore),
              )}
            >
              {etichettaDifficolta(el.valore)}
            </span>
          </button>
          <button
            type="button"
            disabled={addDisabled}
            onClick={() => onAddElement(el.id)}
            className={buttonVariants({ size: "xs" })}
          >
            <Plus className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ExerciseCatalog({ elements, onAddElement, addDisabled }: ExerciseCatalogProps) {
  const [view, setView] = useState<CatalogView>("tabella");
  const [query, setQuery] = useState("");
  const [selectedElement, setSelectedElement] = useState<ElementoCdp | null>(null);
  const [searchActiveIndex, setSearchActiveIndex] = useState(-1);

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];
    return elements
      .filter((element) =>
        [element.id, element.nome, element.descrizione, element.valore]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
      .slice(0, 20);
  }, [elements, query]);

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

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (view !== "tabella" || !query.trim() || searchResults.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSearchActiveIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSearchActiveIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (searchActiveIndex >= 0 && searchActiveIndex < searchResults.length) {
          onAddElement(searchResults[searchActiveIndex].id);
          setQuery("");
          setSearchActiveIndex(-1);
        }
      } else if (event.key === "Escape") {
        setQuery("");
        setSearchActiveIndex(-1);
      }
    },
    [view, query, searchResults, searchActiveIndex, onAddElement],
  );

  return (
    <>
      <div className="grid gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 max-w-xl flex-1">
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchActiveIndex(-1);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Cerca per codice, nome o descrizione"
              className="w-full"
            />
            {view === "tabella" && query.trim() && (
              <div className="absolute top-full right-0 left-0 z-20 mt-1">
                <CatalogSearchDropdown
                  elements={elements}
                  query={query}
                  activeIndex={searchActiveIndex}
                  onAddElement={(id) => {
                    onAddElement(id);
                    setQuery("");
                    setSearchActiveIndex(-1);
                  }}
                  onSelectElement={(el) => {
                    setSelectedElement(el);
                    setQuery("");
                    setSearchActiveIndex(-1);
                  }}
                  addDisabled={addDisabled}
                />
              </div>
            )}
          </div>
          <select
            aria-label="Vista catalogo"
            value={view}
            onChange={(event) => setView(event.target.value as CatalogView)}
            className="border-input bg-background h-8 min-w-40 shrink-0 rounded-lg border px-3 text-sm"
          >
            <option value="tabella">Tabella</option>
            <option value="difficolta">Difficolt&agrave;</option>
          </select>
        </div>

        {view === "tabella" ? (
          <CatalogPdfGrid
            elements={elements}
            onAddElement={onAddElement}
            onSelectElement={setSelectedElement}
            addDisabled={addDisabled}
          />
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
                      Difficolt&agrave; {etichettaDifficolta(section.difficulty)}
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
