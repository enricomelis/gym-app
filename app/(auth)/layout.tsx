import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

async function getValidSession() {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    console.error("[AuthLayout] session:lookup-error", { error });
    return null;
  }
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getValidSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh font-sans">
      <div className="bg-muted hidden flex-col justify-between p-10 lg:flex lg:w-1/2">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">GymApp</h1>
        </div>
        <p className="text-muted-foreground text-sm">Il tuo percorso di allenamento inizia qui.</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="bg-foreground mb-8 flex h-10 w-10 items-center justify-center rounded-lg lg:hidden">
          <span className="text-background text-sm font-bold">G</span>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
