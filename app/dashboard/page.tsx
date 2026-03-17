import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="grid gap-4 font-sans">
      <h2 className="text-foreground text-2xl font-bold tracking-tight">
        Bentornato, {session?.user.name}
      </h2>
      <p className="text-muted-foreground">Il tuo pannello di controllo è in arrivo.</p>
    </div>
  );
}
