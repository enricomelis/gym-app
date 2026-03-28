"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { BackToExercisesButton } from "@/components/exercises/back-to-exercises-button";
import { ExerciseForm } from "@/components/exercises/exercise-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ExerciseDetail } from "@/lib/types/exercise";

interface ExerciseFormShellProps {
  title: string;
  description: string;
  initialData?: ExerciseDetail;
}

export function ExerciseFormShell({ title, description, initialData }: ExerciseFormShellProps) {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const closeHref = initialData ? `/esercizi/${initialData.id}` : "/esercizi";
  const backLabel = initialData ? "Torna al dettaglio" : "Torna a esercizi";

  const handleRequestClose = useEffectEvent(() => {
    if (isDirty) {
      setIsConfirmOpen(true);
      return;
    }

    router.push(closeHref);
  });

  const handleConfirmClose = useEffectEvent(() => {
    setIsConfirmOpen(false);
    router.push(closeHref);
  });

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <>
      <div className="grid gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="grid gap-1">
            <h2 className="text-foreground text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          <BackToExercisesButton
            href={closeHref}
            label={backLabel}
            onNavigate={handleRequestClose}
            className="self-start"
          />
        </div>

        <ExerciseForm
          initialData={initialData}
          closeHref={closeHref}
          onDirtyChange={setIsDirty}
          onRequestClose={handleRequestClose}
        />
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={initialData ? "Uscire senza salvare?" : "Abbandonare il nuovo esercizio?"}
        description={
          initialData
            ? "Hai modifiche non salvate. Se esci ora perderai gli aggiornamenti fatti a questo esercizio."
            : "Hai iniziato a compilare l'esercizio ma non l'hai ancora salvato. Se esci ora perderai tutti i dati inseriti."
        }
        confirmLabel="Esci senza salvare"
        confirmVariant="destructive"
        onConfirm={handleConfirmClose}
      />
    </>
  );
}
