"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SidebarContextValue {
  open: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Default open on desktop
  useEffect(() => {
    setOpen(window.innerWidth >= 1024);
  }, []);

  return (
    <SidebarContext.Provider value={{ open, toggle: () => setOpen((o) => !o) }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger() {
  const { toggle } = useSidebar();
  return (
    <Button variant="ghost" size="icon-sm" onClick={toggle}>
      <PanelLeft className="size-4" />
    </Button>
  );
}
