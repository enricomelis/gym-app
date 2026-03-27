import Image from "next/image";

import type { ElementoCdp } from "@/lib/types/cdp";

import { svgPathElemento, titoloElemento } from "./cdp-constants";

interface CdpElementPreviewProps {
  element: ElementoCdp;
  size?: "xs" | "sm" | "lg";
}

export function CdpElementPreview({ element, size = "sm" }: CdpElementPreviewProps) {
  const svgPath = svgPathElemento(element.id);
  const dimension = size === "lg" ? 112 : size === "sm" ? 48 : 32;
  const imageClass =
    size === "lg"
      ? "h-28 w-28 object-contain"
      : size === "sm"
        ? "h-12 w-12 object-contain"
        : "h-8 w-8 object-contain";

  if (svgPath) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-background/80 p-2">
        <Image
          src={svgPath}
          alt={titoloElemento(element)}
          width={dimension}
          height={dimension}
          unoptimized
          className={imageClass}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center rounded-lg border-2 border-dashed bg-muted/40 p-2">
      <div
        className={
          size === "lg"
            ? "flex h-28 w-28 flex-col items-center justify-center gap-2"
            : size === "sm"
              ? "flex h-12 w-12 items-center justify-center"
              : "flex h-8 w-8 items-center justify-center"
        }
      >
        <svg
          className={
            size === "lg"
              ? "text-muted-foreground/50 size-8"
              : size === "sm"
                ? "text-muted-foreground/50 size-5"
                : "text-muted-foreground/50 size-4"
          }
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
        {size === "lg" && (
          <span className="text-muted-foreground text-center text-[11px]">
            Illustrazione non disponibile
          </span>
        )}
      </div>
    </div>
  );
}
