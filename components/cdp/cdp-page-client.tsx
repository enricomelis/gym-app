"use client";

import { useMemo, useState } from "react";

import type { Attrezzo, ElementoCdp } from "@/lib/types/cdp";

import { ordinaDifficolta } from "./cdp-constants";
import { CdpAttrezzoSelector } from "./cdp-attrezzo-selector";
import { CdpSearch } from "./cdp-search";
import { CdpFilters } from "./cdp-filters";
import { CdpViewSwitcher, type Vista } from "./cdp-view-switcher";
import { CdpVistaTabellaPdf } from "./cdp-vista-tabella-pdf";
import { CdpVistaListaDifficolta } from "./cdp-vista-lista-difficolta";
import { CdpVistaMatrice } from "./cdp-vista-matrice";
import { CdpElementoDialog } from "./cdp-elemento-dialog";

interface CdpPageClientProps {
  datiPerAttrezzo: Partial<Record<Attrezzo, ElementoCdp[]>>;
}

const EMPTY_ELEMENTI: ElementoCdp[] = [];

export function CdpPageClient({ datiPerAttrezzo }: CdpPageClientProps) {
  const [attrezzoAttivo, setAttrezzoAttivo] = useState<Attrezzo>("CL");
  const [vista, setVista] = useState<Vista>("tabella-pdf");
  const [elementoSelezionato, setElementoSelezionato] = useState<ElementoCdp | null>(null);
  const [gruppoAttivo, setGruppoAttivo] = useState<number | null>(null);
  const [difficoltaAttiva, setDifficoltaAttiva] = useState<string | null>(null);

  const elementi = datiPerAttrezzo[attrezzoAttivo] ?? EMPTY_ELEMENTI;

  function handleAttrezzoChange(a: Attrezzo) {
    setAttrezzoAttivo(a);
    setGruppoAttivo(null);
    setDifficoltaAttiva(null);
  }

  const nomiGruppi = useMemo(() => {
    const mappa: Record<number, string> = {};
    for (const el of elementi) {
      if (!mappa[el.gruppo.numero]) {
        mappa[el.gruppo.numero] = el.gruppo.nome;
      }
    }
    return mappa;
  }, [elementi]);

  const difficoltaPresenti = useMemo(() => {
    const set = new Set<string>();
    for (const el of elementi) {
      set.add(el.valore);
    }
    return ordinaDifficolta([...set]);
  }, [elementi]);

  const elementiFiltrati = useMemo(() => {
    return elementi.filter((el) => {
      if (gruppoAttivo !== null && el.gruppo.numero !== gruppoAttivo) return false;
      if (difficoltaAttiva !== null && el.valore !== difficoltaAttiva) return false;
      return true;
    });
  }, [elementi, gruppoAttivo, difficoltaAttiva]);

  return (
    <div className="flex flex-col gap-4">
      {/* Attrezzo selector */}
      <CdpAttrezzoSelector
        attrezzoAttivo={attrezzoAttivo}
        onAttrezzoChange={handleAttrezzoChange}
      />

      {/* Search bar (global, operates on all elements of current attrezzo) */}
      <CdpSearch elementi={elementi} onSelectElement={setElementoSelezionato} />

      {/* Filters */}
      <CdpFilters
        gruppoAttivo={gruppoAttivo}
        setGruppoAttivo={setGruppoAttivo}
        difficoltaAttiva={difficoltaAttiva}
        setDifficoltaAttiva={setDifficoltaAttiva}
        nomiGruppi={nomiGruppi}
        difficoltaPresenti={difficoltaPresenti}
      />

      {/* View switcher + count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {elementiFiltrati.length} element{elementiFiltrati.length === 1 ? "o" : "i"} trovat
          {elementiFiltrati.length === 1 ? "o" : "i"}
        </p>
        <CdpViewSwitcher vista={vista} onVistaChange={setVista} />
      </div>

      {/* Active view */}
      {elementiFiltrati.length > 0 ? (
        <>
          {vista === "tabella-pdf" && (
            <CdpVistaTabellaPdf
              elementi={elementiFiltrati}
              onSelectElement={setElementoSelezionato}
            />
          )}
          {vista === "lista-difficolta" && (
            <CdpVistaListaDifficolta
              elementi={elementiFiltrati}
              onSelectElement={setElementoSelezionato}
            />
          )}
          {vista === "matrice" && (
            <CdpVistaMatrice elementi={elementiFiltrati} onSelectElement={setElementoSelezionato} />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <p className="text-muted-foreground text-sm">Nessun elemento trovato</p>
          <p className="text-muted-foreground text-xs">Prova a modificare i filtri</p>
        </div>
      )}

      {/* Shared detail dialog */}
      <CdpElementoDialog
        elemento={elementoSelezionato}
        onClose={() => setElementoSelezionato(null)}
      />
    </div>
  );
}
