import { BackToExercisesButton } from "@/components/exercises/back-to-exercises-button";
import { EditExerciseShortcut } from "@/components/exercises/edit-exercise-shortcut";
import { ExerciseElementsList } from "@/components/exercises/exercise-elements-list";
import Link from "next/link";

import { DeleteExerciseButton } from "@/components/exercises/delete-exercise-button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyboardShortcutHint } from "@/components/ui/keyboard-shortcut-hint";
import { formatItalianDate } from "@/lib/date";
import { ExercisesStorageNotReadyError } from "@/lib/exercises/errors";
import { getExerciseForUser } from "@/lib/exercises/service";
import { requireSession } from "@/lib/session";

interface ExerciseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const session = await requireSession();
  const { id } = await params;
  let exercise = null;

  try {
    exercise = await getExerciseForUser(id, session.user.id);
  } catch (error) {
    if (error instanceof ExercisesStorageNotReadyError) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Database esercizi non pronto</CardTitle>
            <CardDescription>
              Prima di aprire un dettaglio devi applicare la migration degli esercizi.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }

    throw error;
  }

  if (!exercise) {
    return (
      <div className="grid gap-4">
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Esercizio non trovato</h2>
        <p className="text-muted-foreground">
          L'esercizio richiesto non esiste o non appartiene al tecnico corrente.
        </p>
        <Link href="/esercizi" className={buttonVariants({ variant: "outline" })}>
          Torna alla lista
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <EditExerciseShortcut exerciseId={exercise.id} />
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="grid gap-2">
          <BackToExercisesButton />
          <h2 className="text-foreground text-2xl font-bold tracking-tight">{exercise.name}</h2>
          <p className="text-muted-foreground text-sm">
            {exercise.attrezzo} · {exercise.elementCount} element
            {exercise.elementCount === 1 ? "o" : "i"} · aggiornato il{" "}
            {formatItalianDate(exercise.updatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/esercizi/${exercise.id}/modifica`}
            className={buttonVariants({ variant: "outline" })}
          >
            <span>Modifica</span>
            <KeyboardShortcutHint keys={["M"]} className="ml-1" />
          </Link>
          <DeleteExerciseButton
            exerciseId={exercise.id}
            exerciseName={exercise.name}
            enableShortcut
          />
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <ExerciseElementsList elements={exercise.elements} />
        </div>

        <div className="grid content-start gap-4 text-sm">
          <div className="flex items-baseline gap-2 rounded-lg border bg-muted/30 px-4 py-3">
            <span className="text-muted-foreground font-medium">Nota D</span>
            <span className="text-xl font-bold tracking-tight">{exercise.dScore.toFixed(3)}</span>
          </div>
          <div className="grid gap-1">
            <p>
              <span className="font-medium">Attrezzo:</span> {exercise.attrezzo}
            </p>
            <p>
              <span className="font-medium">Elementi:</span> {exercise.elementCount}
            </p>
          </div>
          {exercise.notes && (
            <div className="grid gap-1">
              <p className="text-xs font-medium">Note</p>
              <p className="text-muted-foreground leading-relaxed">{exercise.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
