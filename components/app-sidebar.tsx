"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardList, LayoutDashboard, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { useSidebar } from "@/components/sidebar-provider";

interface AppSidebarProps {
  user: { name: string };
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cdp", label: "CdP", icon: BookOpen },
  { href: "/esercizi", label: "Esercizi", icon: ClipboardList },
];

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const { open, toggle } = useSidebar();
  const previousPathnameRef = useRef(pathname);

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;

    if (previousPathname === pathname) return;
    if (window.innerWidth >= 1024) return;
    if (!open) return;

    toggle();
  }, [open, pathname, toggle]);

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={toggle} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border flex shrink-0 flex-col border-r transition-[width] duration-200",
          // Mobile: fixed overlay
          "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-60 max-lg:transition-transform max-lg:duration-200",
          !open && "max-lg:-translate-x-full",
          // Desktop: in-flow, width transition
          "lg:relative",
          open ? "lg:w-60" : "lg:w-0 lg:overflow-hidden",
        )}
      >
        <div className="flex w-60 min-w-60 flex-col">
          {/* Branding */}
          <div className="border-sidebar-border flex h-12 items-center justify-between border-b px-4">
            <span className="text-lg font-bold tracking-tight">GymApp</span>
            <Button variant="ghost" size="icon-sm" onClick={toggle}>
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
        </div>
      </aside>
    </>
  );
}
