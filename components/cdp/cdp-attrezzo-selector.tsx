"use client";

import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { ATTREZZI } from "./cdp-constants";

export function CdpAttrezzoSelector() {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {ATTREZZI.map((a) => (
        <Button
          key={a.codice}
          variant={a.disponibile ? "secondary" : "ghost"}
          size="sm"
          disabled={!a.disponibile}
          className={cn(!a.disponibile && "cursor-not-allowed opacity-50")}
        >
          {a.nome}
          {!a.disponibile && <Lock className="ml-1 size-3" />}
        </Button>
      ))}
    </div>
  );
}
