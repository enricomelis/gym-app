import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { CdpBrowser } from "@/components/cdp-browser";
import elementiCorpoLibero from "@/data/cdp/corpo-libero.json";
import type { ElementoCdp } from "@/lib/types/cdp";

export default async function CdpPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-svh font-sans">
      <header className="border-border flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Codice dei Punteggi</h1>
          <p className="text-muted-foreground text-sm">
            Consulta gli elementi del Codice dei Punteggi FIG
          </p>
        </div>
        <span className="text-muted-foreground text-sm">{session.user.name}</span>
      </header>
      <main className="px-6 py-8">
        <CdpBrowser elementi={elementiCorpoLibero as ElementoCdp[]} />
      </main>
    </div>
  );
}
