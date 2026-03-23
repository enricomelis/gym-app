"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { PanelLeft } from "lucide-react";

import { matchesPlatformShortcut } from "@/lib/keyboard-shortcuts";
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!matchesPlatformShortcut(event, "b")) {
        return;
      }

      event.preventDefault();
      setOpen((currentOpen) => !currentOpen);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
