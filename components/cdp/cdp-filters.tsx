"use client";

import { useState } from "react";

import { Popover } from "@base-ui/react/popover";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NUMERI_ROMANI, etichettaDifficolta } from "./cdp-constants";

type TipoFiltro = "gruppo" | "difficolta";

interface CdpFiltersProps {
  gruppoAttivo: number | null;
  setGruppoAttivo: (g: number | null) => void;
  difficoltaAttiva: string | null;
  setDifficoltaAttiva: (d: string | null) => void;
  nomiGruppi: Record<number, string>;
  difficoltaPresenti: string[];
}

export function CdpFilters({
  gruppoAttivo,
  setGruppoAttivo,
  difficoltaAttiva,
  setDifficoltaAttiva,
  nomiGruppi,
  difficoltaPresenti,
}: CdpFiltersProps) {
  const [filtriVisibili, setFiltriVisibili] = useState<Set<TipoFiltro>>(new Set());
  const [popoverAperto, setPopoverAperto] = useState(false);

  function aggiungiFiltro(tipo: TipoFiltro) {
    setFiltriVisibili((prev) => new Set(prev).add(tipo));
    setPopoverAperto(false);
  }

  function rimuoviFiltro(tipo: TipoFiltro) {
    setFiltriVisibili((prev) => {
      const next = new Set(prev);
      next.delete(tipo);
      return next;
    });
    if (tipo === "gruppo") setGruppoAttivo(null);
    if (tipo === "difficolta") setDifficoltaAttiva(null);
  }

  const tuttiFiltri: { tipo: TipoFiltro; label: string }[] = [
    { tipo: "gruppo", label: "Gruppo" },
    { tipo: "difficolta", label: "Difficoltà" },
  ];
  const filtriDisponibili = tuttiFiltri.filter((f) => !filtriVisibili.has(f.tipo));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filtriVisibili.has("gruppo") && (
        <div className="flex items-center gap-1.5 rounded-lg border px-2 py-1 text-sm">
          <span className="text-muted-foreground">Gruppo:</span>
          <select
            value={gruppoAttivo ?? ""}
            onChange={(e) => setGruppoAttivo(e.target.value ? Number(e.target.value) : null)}
            className="cursor-pointer appearance-none bg-transparent font-medium outline-none"
          >
            <option value="">Tutti</option>
            {Object.keys(nomiGruppi)
              .map(Number)
              .sort((a, b) => a - b)
              .map((g) => (
                <option key={g} value={g}>
                  {NUMERI_ROMANI[g]} — {nomiGruppi[g]}
                </option>
              ))}
          </select>
          <button
            onClick={() => rimuoviFiltro("gruppo")}
            className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {filtriVisibili.has("difficolta") && (
        <div className="flex items-center gap-1.5 rounded-lg border px-2 py-1 text-sm">
          <span className="text-muted-foreground">Difficoltà:</span>
          <select
            value={difficoltaAttiva ?? ""}
            onChange={(e) => setDifficoltaAttiva(e.target.value || null)}
            className="cursor-pointer appearance-none bg-transparent font-medium outline-none"
          >
            <option value="">Tutte</option>
            {difficoltaPresenti.map((v) => (
              <option key={v} value={v}>
                {etichettaDifficolta(v)}
              </option>
            ))}
          </select>
          <button
            onClick={() => rimuoviFiltro("difficolta")}
            className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {filtriDisponibili.length > 0 && (
        <Popover.Root open={popoverAperto} onOpenChange={setPopoverAperto}>
          <Popover.Trigger
            render={
              <Button variant="ghost" size="sm">
                <Plus className="size-3.5" />
                Filtro
              </Button>
            }
          />
          <Popover.Portal>
            <Popover.Positioner sideOffset={4}>
              <Popover.Popup className="bg-popover text-popover-foreground z-50 min-w-[140px] rounded-lg border p-1 font-sans shadow-md">
                {filtriDisponibili.map((f) => (
                  <button
                    key={f.tipo}
                    onClick={() => aggiungiFiltro(f.tipo)}
                    className="hover:bg-muted flex w-full items-center rounded-md px-3 py-1.5 text-left text-sm transition-colors"
                  >
                    {f.label}
                  </button>
                ))}
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  );
}
