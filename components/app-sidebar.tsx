"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";

interface AppSidebarProps {
  user: { name: string };
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cdp", label: "CdP", icon: BookOpen },
];

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="bg-sidebar border-sidebar-border fixed top-0 right-0 left-0 z-40 flex items-center border-b px-4 py-3 lg:hidden">
        <Button variant="ghost" size="icon-sm" onClick={() => setMobileOpen(true)}>
          <Menu className="size-5" />
        </Button>
        <span className="ml-3 text-sm font-bold tracking-tight">GymApp</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border flex w-60 shrink-0 flex-col border-r",
          // Mobile: fixed overlay with slide transition
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:relative lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Branding */}
        <div className="border-sidebar-border flex h-14 items-center justify-between border-b px-4">
          <span className="text-lg font-bold tracking-tight">GymApp</span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User area */}
        <div className="border-sidebar-border flex items-center gap-2 border-t px-4 py-3">
          <span className="text-muted-foreground flex-1 truncate text-sm">{user.name}</span>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
