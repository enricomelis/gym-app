export type Attrezzo = "CL" | "CM" | "AN" | "VT" | "PP" | "SB";

export type ValoreDifficolta = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";

export interface GruppoCdp {
  numero: number;
  nome: string;
}

export interface ElementoCdp {
  id: string;
  attrezzo: Attrezzo;
  gruppo: GruppoCdp;
  numero: number;
  valore: ValoreDifficolta;
  descrizione: string;
  nome: string;
}
