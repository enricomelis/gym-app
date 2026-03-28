"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { deleteExercise } from "@/app/actions/exercises";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { KeyboardShortcutHint } from "@/components/ui/keyboard-shortcut-hint";
import { isEditableTarget } from "@/lib/keyboard-shortcuts";

interface DeleteExerciseButtonProps {
  exerciseId: string;
  exerciseName?: string;
  enableShortcut?: boolean;
  showShortcutHint?: boolean;
}

export function DeleteExerciseButton({
  exerciseId,
  exerciseName,
  enableShortcut = false,
  showShortcutHint = true,
}: DeleteExerciseButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function getConfirmationMessage() {
    if (exerciseName) {
      return `Vuoi davvero eliminare l'esercizio "${exerciseName}"?`;
    }

    return "Vuoi davvero eliminare questo esercizio?";
  }

  const openConfirmation = useCallback(() => {
    if (isPending) {
      return;
    }

    setIsConfirmOpen(true);
  }, [isPending]);

  const handleDelete = useCallback(() => {
    if (isPending) {
      return;
    }

    setIsPending(true);
    startTransition(async () => {
      const result = await deleteExercise(exerciseId);
      if (result.success) {
        setIsConfirmOpen(false);
        router.push("/esercizi");
        router.refresh();
        return;
      }

      setIsPending(false);
    });
  }, [exerciseId, isPending, router]);

  useEffect(() => {
    if (!enableShortcut) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "d") {
        return;
      }

      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();
      openConfirmation();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enableShortcut, openConfirmation]);

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        disabled={isPending}
        onClick={() => openConfirmation()}
      >
        <span>{isPending ? "Eliminazione..." : "Elimina"}</span>
        {showShortcutHint && enableShortcut ? (
          <KeyboardShortcutHint keys={["D"]} className="ml-1" />
        ) : null}
      </Button>
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Eliminare esercizio?"
        description={getConfirmationMessage()}
        confirmLabel="Elimina esercizio"
        confirmVariant="destructive"
        isConfirming={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
