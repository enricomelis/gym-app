"use client";

import { useState } from "react";

import type { ElementoCdp } from "@/lib/types/cdp";

import { CdpSearch } from "./cdp-search";
import { CdpViewSwitcher, type Vista } from "./cdp-view-switcher";
import { CdpVistaTabellaPdf } from "./cdp-vista-tabella-pdf";
import { CdpVistaListaDifficolta } from "./cdp-vista-lista-difficolta";
import { CdpVistaMatrice } from "./cdp-vista-matrice";
import { CdpElementoDialog } from "./cdp-elemento-dialog";

interface CdpPageClientProps {
  elementi: ElementoCdp[];
}

export function CdpPageClient({ elementi }: CdpPageClientProps) {
  const [vista, setVista] = useState<Vista>("tabella-pdf");
  const [elementoSelezionato, setElementoSelezionato] = useState<ElementoCdp | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Search bar */}
      <CdpSearch elementi={elementi} onSelectElement={setElementoSelezionato} />

      {/* View switcher */}
      <div className="flex justify-center">
        <CdpViewSwitcher vista={vista} onVistaChange={setVista} />
      </div>

      {/* Active view */}
      {vista === "tabella-pdf" && (
        <CdpVistaTabellaPdf elementi={elementi} onSelectElement={setElementoSelezionato} />
      )}
      {vista === "lista-difficolta" && (
        <CdpVistaListaDifficolta elementi={elementi} onSelectElement={setElementoSelezionato} />
      )}
      {vista === "matrice" && (
        <CdpVistaMatrice elementi={elementi} onSelectElement={setElementoSelezionato} />
      )}

      {/* Shared detail dialog */}
      <CdpElementoDialog
        elemento={elementoSelezionato}
        onClose={() => setElementoSelezionato(null)}
      />
    </div>
  );
}
