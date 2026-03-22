"use client";

import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Attrezzo } from "@/lib/types/cdp";

import { ATTREZZI } from "./cdp-constants";

interface CdpAttrezzoSelectorProps {
  attrezzoAttivo: Attrezzo;
  onAttrezzoChange: (a: Attrezzo) => void;
}

export function CdpAttrezzoSelector({
  attrezzoAttivo,
  onAttrezzoChange,
}: CdpAttrezzoSelectorProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {ATTREZZI.map((a) => (
        <Button
          key={a.codice}
          variant={a.codice === attrezzoAttivo ? "secondary" : a.disponibile ? "outline" : "ghost"}
          size="sm"
          disabled={!a.disponibile}
          className={cn(!a.disponibile && "cursor-not-allowed opacity-50")}
          onClick={() => a.disponibile && onAttrezzoChange(a.codice)}
        >
          {a.nome}
          {!a.disponibile && <Lock className="ml-1 size-3" />}
        </Button>
      ))}
    </div>
  );
}
