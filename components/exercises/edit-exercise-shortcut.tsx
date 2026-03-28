"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { isEditableTarget } from "@/lib/keyboard-shortcuts";

interface EditExerciseShortcutProps {
  exerciseId: string;
}

export function EditExerciseShortcut({ exerciseId }: EditExerciseShortcutProps) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "m") {
        return;
      }

      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();
      router.push(`/esercizi/${exerciseId}/modifica`);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [exerciseId, router]);

  return null;
}
