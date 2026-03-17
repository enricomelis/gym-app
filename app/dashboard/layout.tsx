import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-svh font-sans">
      <header className="border-border flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-foreground text-lg font-bold tracking-tight">GymApp</h1>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm">{session.user.name}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
