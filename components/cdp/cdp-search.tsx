"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { ElementoCdp } from "@/lib/types/cdp";

import { COLORI_DIFFICOLTA, COLORI_GRUPPO, NUMERI_ROMANI, titoloElemento } from "./cdp-constants";

interface CdpSearchProps {
  elementi: ElementoCdp[];
  onSelectElement: (el: ElementoCdp) => void;
}

export function CdpSearch({ elementi, onSelectElement }: CdpSearchProps) {
  const [query, setQuery] = useState("");
  const [aperto, setAperto] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setAperto(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAperto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const risultati = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return elementi
      .filter((el) => {
        return el.nome.toLowerCase().includes(q) || el.descrizione.toLowerCase().includes(q);
      })
      .slice(0, 10);
  }, [elementi, query]);

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-xl">
      <Input
        ref={inputRef}
        placeholder="Cerca elementi... (⌘K)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setAperto(true);
        }}
        onFocus={() => {
          if (query.trim()) setAperto(true);
        }}
        className="h-10 text-base"
      />

      {/* Results overlay */}
      {aperto && risultati.length > 0 && (
        <div className="bg-popover text-popover-foreground absolute top-full right-0 left-0 z-40 mt-1 max-h-80 overflow-y-auto rounded-lg border shadow-lg">
          {risultati.map((el) => (
            <button
              key={el.id}
              className="hover:bg-muted flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors"
              onClick={() => {
                onSelectElement(el);
                setAperto(false);
                setQuery("");
              }}
            >
              {/* Group color dot */}
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COLORI_GRUPPO[el.gruppo.numero] }}
              />

              {/* Element info */}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">
                  <span className="text-muted-foreground font-mono text-xs">{el.numero}.</span>{" "}
                  {titoloElemento(el)}
                </span>
                {el.nome && (
                  <span className="text-muted-foreground truncate text-xs">{el.descrizione}</span>
                )}
              </span>

              {/* Difficulty badge */}
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-xs font-semibold",
                  COLORI_DIFFICOLTA[el.valore],
                )}
              >
                {el.valore}
              </span>

              {/* Group label */}
              <span className="text-muted-foreground shrink-0 text-xs">
                GR {NUMERI_ROMANI[el.gruppo.numero]}
              </span>
            </button>
          ))}
        </div>
      )}

      {aperto && query.trim() && risultati.length === 0 && (
        <div className="bg-popover text-muted-foreground absolute top-full right-0 left-0 z-40 mt-1 rounded-lg border p-4 text-center text-sm shadow-lg">
          Nessun elemento trovato
        </div>
      )}
    </div>
  );
}
