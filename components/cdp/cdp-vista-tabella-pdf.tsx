"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import type { ElementoCdp } from "@/lib/types/cdp";

import {
  COLONNE_PDF,
  COLORI_DIFFICOLTA,
  COLORI_GRUPPO,
  GRUPPI,
  NUMERI_ROMANI,
  troncaTesto,
  titoloElemento,
} from "./cdp-constants";

interface CdpVistaTabellaPdfProps {
  elementi: ElementoCdp[];
  onSelectElement: (el: ElementoCdp) => void;
}

export function CdpVistaTabellaPdf({ elementi, onSelectElement }: CdpVistaTabellaPdfProps) {
  const datiPerGruppo = useMemo(() => {
    return GRUPPI.map((g) => {
      const elementiGruppo = elementi.filter((el) => el.gruppo.numero === g);
      if (elementiGruppo.length === 0) return null;

      const nomeGruppo = elementiGruppo[0].gruppo.nome;
      const maxNumero = Math.max(...elementiGruppo.map((el) => el.numero));
      const maxRow = Math.floor((maxNumero - 1) / 6);

      // Build grid: rows x 6 columns
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

      return { gruppo: g, nomeGruppo, griglia, maxRow };
    }).filter(Boolean) as {
      gruppo: number;
      nomeGruppo: string;
      griglia: (ElementoCdp | null)[][];
      maxRow: number;
    }[];
  }, [elementi]);

  return (
    <div className="flex flex-col gap-10">
      {datiPerGruppo.map((dati) => (
        <div key={dati.gruppo} className="flex flex-col gap-0">
          {/* Group header */}
          <div
            className="rounded-t-lg px-4 py-2.5 text-sm font-bold"
            style={{
              backgroundColor: COLORI_GRUPPO[dati.gruppo],
              color: "#000",
            }}
          >
            Gruppo {NUMERI_ROMANI[dati.gruppo]} — {dati.nomeGruppo}
          </div>

          {/* Grid */}
          <div className="overflow-x-auto rounded-b-lg border">
            <table className="w-full table-fixed border-collapse text-xs">
              <thead>
                <tr className="border-b">
                  {COLONNE_PDF.map((col) => (
                    <th
                      key={col}
                      className="text-muted-foreground px-2 py-2 text-center text-xs font-semibold"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dati.griglia.map((riga, rowIdx) => (
                  <tr key={rowIdx} className="border-b last:border-b-0">
                    {riga.map((el, colIdx) => {
                      if (!el) {
                        return (
                          <td key={colIdx} className="bg-muted/30 px-2 py-2">
                            <div className="h-14" />
                          </td>
                        );
                      }

                      const titolo = titoloElemento(el);
                      const isAboveF = colIdx === 5 && el.valore !== "F";

                      return (
                        <td
                          key={colIdx}
                          className="cursor-pointer border-r px-2 py-2 align-top transition-colors last:border-r-0 hover:brightness-95"
                          onClick={() => onSelectElement(el)}
                          title={titolo}
                        >
                          <div className="flex h-14 flex-col gap-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground font-mono text-[10px]">
                                {el.numero}
                              </span>
                              {isAboveF && (
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded px-1 py-0.5 text-[10px] font-bold",
                                    COLORI_DIFFICOLTA[el.valore],
                                  )}
                                >
                                  {el.valore}
                                </span>
                              )}
                            </div>
                            <span className="text-foreground line-clamp-2 text-[11px] leading-tight">
                              {troncaTesto(titolo, 40)}
                            </span>
                            {/* SVG placeholder area */}
                            <div className="mt-auto flex justify-center">
                              <div className="bg-muted/50 size-6 rounded border border-dashed" />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
