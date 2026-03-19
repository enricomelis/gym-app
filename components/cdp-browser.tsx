"use client";

import { useMemo, useState } from "react";

import { Dialog } from "@base-ui/react/dialog";
import { Popover } from "@base-ui/react/popover";
import { LayoutGrid, Plus, TableProperties, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ElementoCdp, ValoreDifficolta } from "@/lib/types/cdp";

const GRUPPI = [1, 2, 3, 4] as const;

const VALORI_DIFFICOLTA: ValoreDifficolta[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const COLORI_DIFFICOLTA: Record<ValoreDifficolta, string> = {
  A: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  B: "bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300",
  C: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  D: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  E: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  F: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  G: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
  H: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900 dark:text-fuchsia-300",
  I: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  J: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
};

const COLORI_DIFFICOLTA_CELLA: Record<ValoreDifficolta, string> = {
  A: "bg-green-50 dark:bg-green-900/30",
  B: "bg-lime-50 dark:bg-lime-900/30",
  C: "bg-yellow-50 dark:bg-yellow-900/30",
  D: "bg-amber-50 dark:bg-amber-900/30",
  E: "bg-orange-50 dark:bg-orange-900/30",
  F: "bg-red-50 dark:bg-red-900/30",
  G: "bg-rose-50 dark:bg-rose-900/30",
  H: "bg-fuchsia-50 dark:bg-fuchsia-900/30",
  I: "bg-purple-50 dark:bg-purple-900/30",
  J: "bg-violet-50 dark:bg-violet-900/30",
};

const NUMERI_ROMANI: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
};

type TipoFiltro = "gruppo" | "difficolta";
type Vista = "tabella" | "lista";

function troncaTesto(testo: string, max: number = 60): string {
  if (testo.length <= max) return testo;
  return testo.slice(0, max) + "…";
}

function titoloElemento(el: ElementoCdp): string {
  return el.nome || el.descrizione;
}

interface CdpBrowserProps {
  elementi: ElementoCdp[];
}

export function CdpBrowser({ elementi }: CdpBrowserProps) {
  const [ricerca, setRicerca] = useState("");
  const [gruppoAttivo, setGruppoAttivo] = useState<number | null>(null);
  const [difficoltaAttiva, setDifficoltaAttiva] = useState<ValoreDifficolta | null>(null);
  const [filtriVisibili, setFiltriVisibili] = useState<Set<TipoFiltro>>(new Set());
  const [vista, setVista] = useState<Vista>("tabella");
  const [popoverAperto, setPopoverAperto] = useState(false);
  const [elementoSelezionato, setElementoSelezionato] = useState<ElementoCdp | null>(null);

  const nomiGruppi = useMemo(() => {
    const mappa: Record<number, string> = {};
    for (const el of elementi) {
      if (!mappa[el.gruppo.numero]) {
        mappa[el.gruppo.numero] = el.gruppo.nome;
      }
    }
    return mappa;
  }, [elementi]);

  const elementiFiltrati = useMemo(() => {
    return elementi.filter((el) => {
      if (gruppoAttivo !== null && el.gruppo.numero !== gruppoAttivo) return false;
      if (difficoltaAttiva !== null && el.valore !== difficoltaAttiva) return false;
      if (ricerca.trim()) {
        const q = ricerca.toLowerCase();
        const matchDescrizione = el.descrizione.toLowerCase().includes(q);
        const matchNome = el.nome.toLowerCase().includes(q);
        if (!matchDescrizione && !matchNome) return false;
      }
      return true;
    });
  }, [elementi, gruppoAttivo, difficoltaAttiva, ricerca]);

  const difficoltaPresenti = useMemo(() => {
    const set = new Set<ValoreDifficolta>();
    for (const el of elementi) {
      set.add(el.valore);
    }
    return VALORI_DIFFICOLTA.filter((v) => set.has(v));
  }, [elementi]);

  // Dati per la vista tabellare: colonne = difficoltà, righe = elementi impilati
  const datiPerGruppo = useMemo(() => {
    const gruppi = gruppoAttivo !== null ? [gruppoAttivo] : GRUPPI.map((g) => g);

    return gruppi
      .map((g) => {
        const elementiGruppo = elementiFiltrati.filter((el) => el.gruppo.numero === g);
        if (elementiGruppo.length === 0) return null;

        // Difficoltà presenti in questo gruppo
        const difficoltaSet = new Set<ValoreDifficolta>();
        for (const el of elementiGruppo) {
          difficoltaSet.add(el.valore);
        }
        const colonne = VALORI_DIFFICOLTA.filter((v) => difficoltaSet.has(v));

        // Raggruppa elementi per difficoltà, ordinati per numero
        const perDifficolta = new Map<ValoreDifficolta, ElementoCdp[]>();
        for (const col of colonne) {
          perDifficolta.set(
            col,
            elementiGruppo.filter((el) => el.valore === col).sort((a, b) => a.numero - b.numero),
          );
        }

        // Numero massimo di righe = colonna più lunga
        const maxRighe = Math.max(...colonne.map((c) => perDifficolta.get(c)!.length));

        return {
          gruppo: g,
          nomeGruppo: nomiGruppi[g],
          colonne,
          perDifficolta,
          maxRighe,
        };
      })
      .filter(Boolean);
  }, [elementiFiltrati, gruppoAttivo, nomiGruppi]);

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
    <div className="flex flex-col gap-4">
      {/* Riga ricerca + switch vista */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Cerca per descrizione o nome..."
          value={ricerca}
          onChange={(e) => setRicerca(e.target.value)}
          className="max-w-md"
        />
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={vista === "tabella" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setVista("tabella")}
            title="Vista tabella"
          >
            <TableProperties />
          </Button>
          <Button
            variant={vista === "lista" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setVista("lista")}
            title="Vista card"
          >
            <LayoutGrid />
          </Button>
        </div>
      </div>

      {/* Filtri Notion-style */}
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
              {GRUPPI.map((g) => (
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
              onChange={(e) =>
                setDifficoltaAttiva(e.target.value ? (e.target.value as ValoreDifficolta) : null)
              }
              className="cursor-pointer appearance-none bg-transparent font-medium outline-none"
            >
              <option value="">Tutte</option>
              {difficoltaPresenti.map((v) => (
                <option key={v} value={v}>
                  {v}
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

      {/* Conteggio risultati */}
      <p className="text-muted-foreground text-sm">
        {elementiFiltrati.length} element{elementiFiltrati.length === 1 ? "o" : "i"} trovat
        {elementiFiltrati.length === 1 ? "o" : "i"}
      </p>

      {/* Contenuto */}
      {elementiFiltrati.length > 0 ? (
        vista === "tabella" ? (
          <div className="flex flex-col gap-8">
            {datiPerGruppo.map((dati) => {
              if (!dati) return null;
              return (
                <div key={dati.gruppo} className="flex flex-col gap-3">
                  <h3 className="text-lg font-semibold">
                    Gruppo {NUMERI_ROMANI[dati.gruppo]} — {dati.nomeGruppo}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b">
                          {dati.colonne.map((col) => (
                            <th
                              key={col}
                              className={cn(
                                "px-3 py-2 text-center font-semibold",
                                COLORI_DIFFICOLTA[col],
                              )}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: dati.maxRighe }, (_, i) => (
                          <tr key={i} className="border-b last:border-b-0">
                            {dati.colonne.map((col) => {
                              const el = dati.perDifficolta.get(col)?.[i];
                              if (!el) {
                                return <td key={col} className="px-3 py-2" />;
                              }
                              const titolo = titoloElemento(el);
                              return (
                                <td
                                  key={col}
                                  className={cn(
                                    "cursor-pointer px-3 py-2 text-xs transition-colors hover:brightness-95",
                                    COLORI_DIFFICOLTA_CELLA[el.valore],
                                  )}
                                  title={titolo}
                                  onClick={() => setElementoSelezionato(el)}
                                >
                                  <span className="text-muted-foreground font-mono">
                                    {el.numero}.
                                  </span>{" "}
                                  {troncaTesto(titolo, 50)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {elementiFiltrati.map((el) => (
              <Card
                key={el.id}
                size="sm"
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setElementoSelezionato(el)}
              >
                <CardHeader>
                  <CardTitle className="text-sm">{troncaTesto(titoloElemento(el))}</CardTitle>
                  <CardAction>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
                        COLORI_DIFFICOLTA[el.valore],
                      )}
                    >
                      {el.valore}
                    </span>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  <p className="text-foreground text-sm leading-relaxed">
                    {troncaTesto(el.descrizione, 100)}
                  </p>
                  {el.nome && <p className="text-muted-foreground text-xs italic">{el.nome}</p>}
                  <p className="text-muted-foreground mt-1 text-xs">
                    Gruppo {NUMERI_ROMANI[el.gruppo.numero]}: {el.gruppo.nome}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <p className="text-muted-foreground text-sm">Nessun elemento trovato</p>
          <p className="text-muted-foreground text-xs">Prova a modificare i filtri o la ricerca</p>
        </div>
      )}

      {/* Dialog dettaglio elemento */}
      <Dialog.Root
        open={elementoSelezionato !== null}
        onOpenChange={(open) => {
          if (!open) setElementoSelezionato(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Popup className="bg-background fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 font-sans shadow-lg">
            {elementoSelezionato && (
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <Dialog.Title className="text-lg font-semibold">
                    {titoloElemento(elementoSelezionato)}
                  </Dialog.Title>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-md px-2.5 py-1 text-sm font-semibold",
                      COLORI_DIFFICOLTA[elementoSelezionato.valore],
                    )}
                  >
                    {elementoSelezionato.valore}
                  </span>
                </div>

                <Dialog.Description className="text-foreground text-sm leading-relaxed">
                  {elementoSelezionato.descrizione}
                </Dialog.Description>

                {elementoSelezionato.nome && (
                  <p className="text-muted-foreground text-sm italic">{elementoSelezionato.nome}</p>
                )}

                <div className="text-muted-foreground flex items-center gap-3 text-xs">
                  <span>
                    Gruppo {NUMERI_ROMANI[elementoSelezionato.gruppo.numero]}:{" "}
                    {elementoSelezionato.gruppo.nome}
                  </span>
                  <span>·</span>
                  <span>N° {elementoSelezionato.numero}</span>
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
    </div>
  );
}
