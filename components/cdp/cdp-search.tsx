"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { getPlatformShortcutLabel, matchesPlatformShortcut } from "@/lib/keyboard-shortcuts";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { ElementoCdp } from "@/lib/types/cdp";

import {
  COLORI_GRUPPO,
  NUMERI_ROMANI,
  coloreDifficolta,
  etichettaDifficolta,
  titoloElemento,
} from "./cdp-constants";

interface CdpSearchProps {
  elementi: ElementoCdp[];
  onSelectElement: (el: ElementoCdp) => void;
}

export function CdpSearch({ elementi, onSelectElement }: CdpSearchProps) {
  const [query, setQuery] = useState("");
  const [aperto, setAperto] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const shortcutLabel = useMemo(() => getPlatformShortcutLabel("K"), []);

  // Global shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (matchesPlatformShortcut(e, "k")) {
        e.preventDefault();
        inputRef.current?.focus();
        setAperto(true);
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

  // Reset focused index when results change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [risultati]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex < 0 || !resultsRef.current) return;
    const items = resultsRef.current.querySelectorAll("[data-result]");
    items[focusedIndex]?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex]);

  function seleziona(el: ElementoCdp) {
    onSelectElement(el);
    setAperto(false);
    setQuery("");
    setFocusedIndex(-1);
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (!aperto || risultati.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, risultati.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && focusedIndex >= 0 && focusedIndex < risultati.length) {
      e.preventDefault();
      seleziona(risultati[focusedIndex]);
    }
  }

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-2xl">
      <Input
        ref={inputRef}
        placeholder={`Cerca elementi... (${shortcutLabel})`}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setAperto(true);
        }}
        onFocus={() => {
          if (query.trim()) setAperto(true);
        }}
        onKeyDown={handleInputKeyDown}
        role="combobox"
        aria-expanded={aperto && risultati.length > 0}
        aria-activedescendant={focusedIndex >= 0 ? `search-result-${focusedIndex}` : undefined}
        className="h-12 text-lg"
      />

      {/* Results overlay */}
      {aperto && risultati.length > 0 && (
        <div
          ref={resultsRef}
          role="listbox"
          className="bg-popover text-popover-foreground absolute top-full right-0 left-0 z-40 mt-1 max-h-80 overflow-y-auto rounded-lg border shadow-lg"
        >
          {risultati.map((el, index) => (
            <button
              key={el.id}
              id={`search-result-${index}`}
              data-result
              role="option"
              aria-selected={index === focusedIndex}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                index === focusedIndex ? "bg-muted" : "hover:bg-muted",
              )}
              onClick={() => seleziona(el)}
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
                  coloreDifficolta(el.valore),
                )}
              >
                {etichettaDifficolta(el.valore)}
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
