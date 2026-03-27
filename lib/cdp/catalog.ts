import elementiAnelli from "@/data/cdp/anelli.json";
import elementiCavallo from "@/data/cdp/cavallo-con-maniglie.json";
import elementiCorpoLibero from "@/data/cdp/corpo-libero.json";
import elementiParallele from "@/data/cdp/parallele.json";
import elementiSbarra from "@/data/cdp/sbarra.json";
import elementiVolteggio from "@/data/cdp/volteggio.json";
import type { Attrezzo, ElementoCdp } from "@/lib/types/cdp";

const datiPerAttrezzo: Record<Attrezzo, ElementoCdp[]> = {
  CL: elementiCorpoLibero as ElementoCdp[],
  CM: elementiCavallo as ElementoCdp[],
  AN: elementiAnelli as ElementoCdp[],
  VT: elementiVolteggio as ElementoCdp[],
  PP: elementiParallele as ElementoCdp[],
  SB: elementiSbarra as ElementoCdp[],
};

const tuttiGliElementi = Object.values(datiPerAttrezzo).flat();
const elementiById = new Map<string, ElementoCdp>(tuttiGliElementi.map((el) => [el.id, el]));

export function getCatalogByAttrezzo(attrezzo: Attrezzo): ElementoCdp[] {
  return datiPerAttrezzo[attrezzo];
}

export function getAllCatalogElements(): ElementoCdp[] {
  return tuttiGliElementi;
}

export function getCatalogElementById(elementId: string): ElementoCdp | null {
  return elementiById.get(elementId) ?? null;
}

export function hasCatalogElement(elementId: string): boolean {
  return elementiById.has(elementId);
}
