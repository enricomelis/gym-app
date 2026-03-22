"use client";

import { useMemo, useState } from "react";

import { Dialog } from "@base-ui/react/dialog";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ElementoCdp, ValoreDifficolta } from "@/lib/types/cdp";

import {
  COLORI_DIFFICOLTA,
  COLORI_GRUPPO,
  GRUPPI,
  NUMERI_ROMANI,
  VALORI_DIFFICOLTA,
  titoloElemento,
} from "./cdp-constants";

interface CdpVistaMatriceProps {
  elementi: ElementoCdp[];
  onSelectElement: (el: ElementoCdp) => void;
}

interface SubDialogState {
  gruppo: number;
  valore: ValoreDifficolta;
  elementi: ElementoCdp[];
}

export function CdpVistaMatrice({ elementi, onSelectElement }: CdpVistaMatriceProps) {
  const [subDialog, setSubDialog] = useState<SubDialogState | null>(null);

  const { matrice, maxCount } = useMemo(() => {
    const m: Record<string, ElementoCdp[]> = {};
    let max = 0;

    for (const el of elementi) {
      const key = `${el.gruppo.numero}-${el.valore}`;
      if (!m[key]) m[key] = [];
      m[key].push(el);
      if (m[key].length > max) max = m[key].length;
    }

    return { matrice: m, maxCount: max };
  }, [elementi]);

  // Determine which difficulty rows have any elements
  const difficoltaPresenti = useMemo(() => {
    return VALORI_DIFFICOLTA.filter((v) =>
      GRUPPI.some((g) => {
        const key = `${g}-${v}`;
        return matrice[key] && matrice[key].length > 0;
      }),
    );
  }, [matrice]);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-3 py-2" />
              {GRUPPI.map((g) => (
                <th
                  key={g}
                  className="px-3 py-2 text-center text-sm font-bold"
                  style={{
                    backgroundColor: COLORI_GRUPPO[g],
                    color: "#000",
                  }}
                >
                  GR {NUMERI_ROMANI[g]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {difficoltaPresenti.map((v) => (
              <tr key={v} className="border-b last:border-b-0">
                <td className="px-3 py-2 text-center">
                  <span
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded text-sm font-bold",
                      COLORI_DIFFICOLTA[v],
                    )}
                  >
                    {v}
                  </span>
                </td>
                {GRUPPI.map((g) => {
                  const key = `${g}-${v}`;
                  const els = matrice[key] ?? [];
                  const count = els.length;
                  const opacity = count > 0 ? 0.1 + 0.9 * (count / maxCount) : 0;

                  return (
                    <td key={g} className="border-r px-3 py-2 text-center last:border-r-0">
                      {count > 0 ? (
                        <button
                          className="relative mx-auto flex size-12 items-center justify-center rounded-lg text-lg font-bold transition-transform hover:scale-110"
                          style={{
                            backgroundColor: `${COLORI_GRUPPO[g]}${Math.round(opacity * 255)
                              .toString(16)
                              .padStart(2, "0")}`,
                          }}
                          onClick={() => setSubDialog({ gruppo: g, valore: v, elementi: els })}
                        >
                          {count}
                        </button>
                      ) : (
                        <div className="bg-muted/30 mx-auto flex size-12 items-center justify-center rounded-lg">
                          <span className="text-muted-foreground/50 text-sm">—</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sub-dialog: list of elements for a group+difficulty */}
      <Dialog.Root
        open={subDialog !== null}
        onOpenChange={(open) => {
          if (!open) setSubDialog(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Popup className="bg-background fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 font-sans shadow-lg">
            {subDialog && (
              <div className="flex flex-col gap-4">
                <Dialog.Title className="text-lg font-semibold">
                  Gruppo {NUMERI_ROMANI[subDialog.gruppo]} — Difficoltà {subDialog.valore}
                </Dialog.Title>
                <Dialog.Description className="text-muted-foreground text-sm">
                  {subDialog.elementi.length} element
                  {subDialog.elementi.length === 1 ? "o" : "i"}
                </Dialog.Description>

                <div className="flex max-h-60 flex-col overflow-y-auto">
                  {subDialog.elementi
                    .toSorted((a, b) => a.numero - b.numero)
                    .map((el) => (
                      <button
                        key={el.id}
                        className="hover:bg-muted flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors"
                        onClick={() => {
                          setSubDialog(null);
                          onSelectElement(el);
                        }}
                      >
                        <span className="text-muted-foreground w-10 font-mono text-sm">
                          {el.numero}.
                        </span>
                        <span className="min-w-0 flex-1 truncate">{titoloElemento(el)}</span>
                      </button>
                    ))}
                </div>

                <div className="flex justify-end">
                  <Dialog.Close
                    render={
                      <Button variant="outline" size="sm">
                        Chiudi
                      </Button>
                    }
                  />
                </div>
              </div>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
