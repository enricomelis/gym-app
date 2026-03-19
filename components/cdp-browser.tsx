"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ElementoCdp, ValoreDifficolta } from "@/lib/types/cdp";

const GRUPPI = [1, 2, 3, 4] as const;

const VALORI_DIFFICOLTA: ValoreDifficolta[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const COLORI_DIFFICOLTA: Record<ValoreDifficolta, string> = {
  A: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  B: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  C: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  D: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  E: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  F: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  G: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  H: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  I: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
  J: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
};

const NUMERI_ROMANI: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
};

interface CdpBrowserProps {
  elementi: ElementoCdp[];
}

export function CdpBrowser({ elementi }: CdpBrowserProps) {
  const [ricerca, setRicerca] = useState("");
  const [gruppoAttivo, setGruppoAttivo] = useState<number | null>(null);
  const [difficoltaAttiva, setDifficoltaAttiva] = useState<ValoreDifficolta | null>(null);

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
        const matchId = el.id.toLowerCase().includes(q);
        if (!matchDescrizione && !matchNome && !matchId) return false;
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

  return (
    <div className="flex flex-col gap-6">
      {/* Barra ricerca */}
      <Input
        placeholder="Cerca per descrizione, nome o ID..."
        value={ricerca}
        onChange={(e) => setRicerca(e.target.value)}
        className="max-w-md"
      />

      {/* Filtri */}
      <div className="flex flex-col gap-3">
        {/* Filtro gruppo */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm font-medium">Gruppo:</span>
          <Button
            variant={gruppoAttivo === null ? "default" : "outline"}
            size="sm"
            onClick={() => setGruppoAttivo(null)}
          >
            Tutti
          </Button>
          {GRUPPI.map((g) => (
            <Button
              key={g}
              variant={gruppoAttivo === g ? "default" : "outline"}
              size="sm"
              onClick={() => setGruppoAttivo(gruppoAttivo === g ? null : g)}
              title={nomiGruppi[g]}
            >
              {NUMERI_ROMANI[g]}
            </Button>
          ))}
        </div>

        {/* Filtro difficolta */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm font-medium">Difficoltà:</span>
          <Button
            variant={difficoltaAttiva === null ? "default" : "outline"}
            size="sm"
            onClick={() => setDifficoltaAttiva(null)}
          >
            Tutte
          </Button>
          {difficoltaPresenti.map((v) => (
            <Button
              key={v}
              variant={difficoltaAttiva === v ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficoltaAttiva(difficoltaAttiva === v ? null : v)}
            >
              {v}
            </Button>
          ))}
        </div>
      </div>

      {/* Nome gruppo attivo */}
      {gruppoAttivo !== null && nomiGruppi[gruppoAttivo] && (
        <p className="text-muted-foreground text-sm">
          Gruppo {NUMERI_ROMANI[gruppoAttivo]}: {nomiGruppi[gruppoAttivo]}
        </p>
      )}

      {/* Conteggio risultati */}
      <p className="text-muted-foreground text-sm">
        {elementiFiltrati.length} element{elementiFiltrati.length === 1 ? "o" : "i"} trovat
        {elementiFiltrati.length === 1 ? "o" : "i"}
      </p>

      {/* Griglia elementi */}
      {elementiFiltrati.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {elementiFiltrati.map((el) => (
            <Card key={el.id} size="sm">
              <CardHeader>
                <CardTitle className="font-mono text-sm">{el.id}</CardTitle>
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
                <p className="text-foreground text-sm leading-relaxed">{el.descrizione}</p>
                {el.nome && <p className="text-muted-foreground text-xs italic">{el.nome}</p>}
                <p className="text-muted-foreground mt-1 text-xs">
                  Gruppo {NUMERI_ROMANI[el.gruppo.numero]}: {el.gruppo.nome}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <p className="text-muted-foreground text-sm">Nessun elemento trovato</p>
          <p className="text-muted-foreground text-xs">Prova a modificare i filtri o la ricerca</p>
        </div>
      )}
    </div>
  );
}
