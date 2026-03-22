"use client";

import { Grid3x3, List, TableProperties } from "lucide-react";

import { Button } from "@/components/ui/button";

export type Vista = "tabella-pdf" | "lista-difficolta" | "matrice";

interface CdpViewSwitcherProps {
  vista: Vista;
  onVistaChange: (v: Vista) => void;
}

const VISTE: { id: Vista; label: string; icon: typeof TableProperties }[] = [
  { id: "tabella-pdf", label: "Tabella", icon: TableProperties },
  { id: "lista-difficolta", label: "Per Difficoltà", icon: List },
  { id: "matrice", label: "Matrice", icon: Grid3x3 },
];

export function CdpViewSwitcher({ vista, onVistaChange }: CdpViewSwitcherProps) {
  return (
    <div className="flex items-center gap-1">
      {VISTE.map((v) => (
        <Button
          key={v.id}
          variant={vista === v.id ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onVistaChange(v.id)}
          title={v.label}
        >
          <v.icon className="size-4" />
          <span className="hidden sm:inline">{v.label}</span>
        </Button>
      ))}
    </div>
  );
}
