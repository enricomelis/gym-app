import { CdpPageClient } from "@/components/cdp/cdp-page-client";
import elementiCorpoLibero from "@/data/cdp/corpo-libero.json";
import elementiCavallo from "@/data/cdp/cavallo-con-maniglie.json";
import type { Attrezzo, ElementoCdp } from "@/lib/types/cdp";

const datiPerAttrezzo: Partial<Record<Attrezzo, ElementoCdp[]>> = {
  CL: elementiCorpoLibero as ElementoCdp[],
  CM: elementiCavallo as ElementoCdp[],
};

export default function CdpPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Codice dei Punteggi</h2>
        <p className="text-muted-foreground text-sm">
          Consulta gli elementi del Codice dei Punteggi FGI
        </p>
      </div>
      <CdpPageClient datiPerAttrezzo={datiPerAttrezzo} />
    </div>
  );
}
