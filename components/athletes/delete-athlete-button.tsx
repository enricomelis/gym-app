"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { deleteAthlete } from "@/app/actions/athletes";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DeleteAthleteButtonProps {
  athleteId: string;
  athleteName?: string;
}

export function DeleteAthleteButton({ athleteId, athleteName }: DeleteAthleteButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function getConfirmationMessage() {
    if (athleteName) {
      return `Vuoi davvero eliminare il profilo atleta di "${athleteName}"?`;
    }

    return "Vuoi davvero eliminare questo profilo atleta?";
  }

  function handleDelete() {
    if (isPending) {
      return;
    }

    setIsPending(true);
    startTransition(async () => {
      const result = await deleteAthlete(athleteId);
      if (result.success) {
        setIsConfirmOpen(false);
        router.push("/atleti");
        router.refresh();
        return;
      }

      setIsPending(false);
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        disabled={isPending}
        onClick={() => setIsConfirmOpen(true)}
      >
        {isPending ? "Eliminazione..." : "Elimina"}
      </Button>
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Eliminare atleta?"
        description={getConfirmationMessage()}
        confirmLabel="Elimina atleta"
        confirmVariant="destructive"
        isConfirming={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
