import type { ValoreDifficolta } from "@/lib/types/cdp";

export const GRUPPI = [1, 2, 3, 4] as const;

export const VALORI_DIFFICOLTA: ValoreDifficolta[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
];

export const COLORI_DIFFICOLTA: Record<ValoreDifficolta, string> = {
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

export const COLORI_DIFFICOLTA_CELLA: Record<ValoreDifficolta, string> = {
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

export const NUMERI_ROMANI: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
};

export const COLORI_GRUPPO: Record<number, string> = {
  1: "#54FEFF",
  2: "#4EFC00",
  3: "#F627FE",
  4: "#FDFC07",
};

export const COLONNE_PDF = ["A", "B", "C", "D", "E", "F+"] as const;

export function troncaTesto(testo: string, max: number = 60): string {
  if (testo.length <= max) return testo;
  return testo.slice(0, max) + "…";
}

export function titoloElemento(el: { nome: string; descrizione: string }): string {
  return el.nome || el.descrizione;
}
