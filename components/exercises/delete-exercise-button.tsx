"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { deleteExercise } from "@/app/actions/exercises";
import { Button } from "@/components/ui/button";

interface DeleteExerciseButtonProps {
  exerciseId: string;
}

export function DeleteExerciseButton({ exerciseId }: DeleteExerciseButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        setIsPending(true);
        startTransition(async () => {
          const result = await deleteExercise(exerciseId);
          if (result.success) {
            router.push("/esercizi");
            router.refresh();
            return;
          }

          setIsPending(false);
        });
      }}
    >
      {isPending ? "Eliminazione..." : "Elimina"}
    </Button>
  );
}
