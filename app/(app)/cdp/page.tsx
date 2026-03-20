import { CdpPageClient } from "@/components/cdp/cdp-page-client";
import elementiCorpoLibero from "@/data/cdp/corpo-libero.json";
import type { ElementoCdp } from "@/lib/types/cdp";

export default function CdpPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Codice dei Punteggi</h2>
        <p className="text-muted-foreground text-sm">
          Consulta gli elementi del Codice dei Punteggi FGI
        </p>
      </div>
      <CdpPageClient elementi={elementiCorpoLibero as ElementoCdp[]} />
    </div>
  );
}
