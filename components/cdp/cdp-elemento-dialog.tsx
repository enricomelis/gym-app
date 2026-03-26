"use client";

import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ElementoCdp } from "@/lib/types/cdp";

import {
  COLORI_GRUPPO,
  NUMERI_ROMANI,
  coloreDifficolta,
  etichettaDifficolta,
  svgPathElemento,
  titoloElemento,
} from "./cdp-constants";

interface CdpElementoDialogProps {
  elemento: ElementoCdp | null;
  onClose: () => void;
}

export function CdpElementoDialog({ elemento, onClose }: CdpElementoDialogProps) {
  const svgPath = elemento ? svgPathElemento(elemento.id) : null;

  return (
    <Dialog.Root
      open={elemento !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup className="bg-background fixed top-1/2 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 font-sans shadow-lg">
          {elemento && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <Dialog.Title className="text-lg font-semibold">
                  {titoloElemento(elemento)}
                </Dialog.Title>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-md px-2.5 py-1 text-sm font-semibold",
                    coloreDifficolta(elemento.valore),
                  )}
                >
                  {etichettaDifficolta(elemento.valore)}
                </span>
              </div>

              {elemento.nome && (
                <Dialog.Description className="text-foreground leading-relaxed">
                  {elemento.descrizione}
                </Dialog.Description>
              )}

              {/* Group color bar */}
              <div
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                style={{
                  backgroundColor: COLORI_GRUPPO[elemento.gruppo.numero],
                  color: "#000",
                }}
              >
                Gruppo {NUMERI_ROMANI[elemento.gruppo.numero]}: {elemento.gruppo.nome}
              </div>

              <div className="text-muted-foreground text-sm">N° {elemento.numero}</div>

              {/* SVG illustration or placeholder */}
              {svgPath ? (
                <div className="flex items-center justify-center rounded-lg border p-4">
                  <Image
                    src={svgPath}
                    alt={titoloElemento(elemento)}
                    width={280}
                    height={280}
                    unoptimized
                    className="h-[280px] w-[280px] object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-4">
                  <div className="flex h-[280px] w-[280px] flex-col items-center justify-center gap-2 text-center">
                    <svg
                      className="text-muted-foreground/50 size-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    <span className="text-muted-foreground text-xs">
                      Illustrazione non disponibile
                    </span>
                  </div>
                </div>
              )}

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
  );
}
