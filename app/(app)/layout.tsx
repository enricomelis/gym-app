import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/sidebar-provider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-svh font-sans">
        <AppSidebar user={session.user} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-border flex h-12 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
