"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import type { ElementoCdp, ValoreDifficolta } from "@/lib/types/cdp";

import {
  COLORI_DIFFICOLTA,
  COLORI_GRUPPO,
  NUMERI_ROMANI,
  VALORI_DIFFICOLTA,
  titoloElemento,
  troncaTesto,
} from "./cdp-constants";

interface CdpVistaListaDifficoltaProps {
  elementi: ElementoCdp[];
  onSelectElement: (el: ElementoCdp) => void;
}

export function CdpVistaListaDifficolta({
  elementi,
  onSelectElement,
}: CdpVistaListaDifficoltaProps) {
  const sezioni = useMemo(() => {
    const perDifficolta = new Map<ValoreDifficolta, ElementoCdp[]>();

    for (const el of elementi) {
      const lista = perDifficolta.get(el.valore) ?? [];
      lista.push(el);
      perDifficolta.set(el.valore, lista);
    }

    return VALORI_DIFFICOLTA.filter((v) => perDifficolta.has(v)).map((v) => ({
      valore: v,
      elementi: perDifficolta.get(v)!.sort((a, b) => {
        if (a.gruppo.numero !== b.gruppo.numero) return a.gruppo.numero - b.gruppo.numero;
        return a.numero - b.numero;
      }),
    }));
  }, [elementi]);

  return (
    <div className="flex flex-col gap-8">
      {sezioni.map((sezione) => (
        <div key={sezione.valore} className="flex flex-col gap-2">
          {/* Section header */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-lg text-lg font-bold",
                COLORI_DIFFICOLTA[sezione.valore],
              )}
            >
              {sezione.valore}
            </span>
            <div>
              <span className="text-sm font-semibold">Difficoltà {sezione.valore}</span>
              <span className="text-muted-foreground ml-2 text-xs">
                ({sezione.elementi.length} element{sezione.elementi.length === 1 ? "o" : "i"})
              </span>
            </div>
          </div>

          {/* Elements list */}
          <div className="flex flex-col">
            {sezione.elementi.map((el) => (
              <button
                key={el.id}
                className="hover:bg-muted flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors"
                onClick={() => onSelectElement(el)}
              >
                {/* Group color dot */}
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORI_GRUPPO[el.gruppo.numero] }}
                  title={`Gruppo ${NUMERI_ROMANI[el.gruppo.numero]}`}
                />

                <span className="text-muted-foreground w-8 shrink-0 font-mono text-xs">
                  {el.numero}.
                </span>

                <span className="min-w-0 flex-1 truncate">{troncaTesto(titoloElemento(el))}</span>

                <span className="text-muted-foreground shrink-0 text-xs">
                  GR {NUMERI_ROMANI[el.gruppo.numero]}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
