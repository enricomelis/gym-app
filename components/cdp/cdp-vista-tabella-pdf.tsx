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
  svgPathElemento,
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 lg:px-12">
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
            {/* Column headers */}
            <div className="grid grid-cols-6 border-b">
              {COLONNE_PDF.map((col) => (
                <div
                  key={col}
                  className="text-muted-foreground px-2 py-2 text-center text-sm font-semibold"
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
                  const isAboveF = colIdx === 5 && el.valore !== "F";
                  const svgPath = svgPathElemento(el.id);

                  return (
                    <div
                      key={colIdx}
                      className="flex aspect-square cursor-pointer flex-col gap-1 border-r p-2 transition-colors last:border-r-0 hover:brightness-95"
                      onClick={() => onSelectElement(el)}
                      title={titolo}
                    >
                      {/* Header: number + difficulty badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-mono text-xs">{el.numero}</span>
                        {isAboveF && (
                          <span
                            className={cn(
                              "inline-flex items-center rounded px-1 py-0.5 text-xs font-bold",
                              COLORI_DIFFICOLTA[el.valore],
                            )}
                          >
                            {el.valore}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <span className="text-foreground line-clamp-3 text-xs leading-snug">
                        {troncaTesto(titolo, 50)}
                      </span>

                      {/* SVG thumbnail or placeholder */}
                      <div className="mt-auto flex flex-1 items-end justify-center">
                        {svgPath ? (
                          <img src={svgPath} alt="" className="max-h-12 w-auto object-contain" />
                        ) : (
                          <div className="bg-muted/50 size-8 rounded border border-dashed" />
                        )}
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
