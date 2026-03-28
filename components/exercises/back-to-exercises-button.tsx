"use client";

import Link from "next/link";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { KeyboardShortcutHint } from "@/components/ui/keyboard-shortcut-hint";
import { isEditableTarget } from "@/lib/keyboard-shortcuts";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

interface BackToExercisesButtonProps {
  href?: string;
  label?: string;
  onNavigate?: () => void;
  showShortcutHint?: boolean;
  className?: string;
}

export function BackToExercisesButton({
  href = "/esercizi",
  label = "Torna a esercizi",
  onNavigate,
  showShortcutHint = true,
  className,
}: BackToExercisesButtonProps) {
  const router = useRouter();
  const navigate = useCallback(() => {
    if (onNavigate) {
      onNavigate();
      return;
    }

    router.push(href);
  }, [href, onNavigate, router]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();
      navigate();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant: "outline" }), className)}
      onClick={(event) => {
        if (!onNavigate) {
          return;
        }

        event.preventDefault();
        navigate();
      }}
    >
      <ArrowLeft className="size-4" />
      <span>{label}</span>
      {showShortcutHint ? <KeyboardShortcutHint keys={["Esc"]} className="ml-1" /> : null}
    </Link>
  );
}
