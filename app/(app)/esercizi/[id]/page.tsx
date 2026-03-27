import Link from "next/link";

import { DeleteExerciseButton } from "@/components/exercises/delete-exercise-button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="grid gap-2">
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
            Modifica
          </Link>
          <DeleteExerciseButton exerciseId={exercise.id} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Riepilogo</CardTitle>
            <CardDescription>Metadati principali e nota D calcolata live.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1 rounded-xl border bg-muted/30 p-4">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">Nota D</p>
              <p className="text-3xl font-bold tracking-tight">{exercise.dScore.toFixed(3)}</p>
            </div>
            <div className="grid gap-1 text-sm">
              <p>
                <span className="font-medium">Attrezzo:</span> {exercise.attrezzo}
              </p>
              <p>
                <span className="font-medium">Elementi:</span> {exercise.elementCount}
              </p>
            </div>
            {exercise.notes && (
              <div className="grid gap-2">
                <p className="text-sm font-medium">Note</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{exercise.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Elementi dell'esercizio</CardTitle>
            <CardDescription>Sequenza ordinata degli elementi selezionati.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {exercise.elements.map((item) => (
              <div key={`${item.elementId}-${item.order}`} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="grid gap-1">
                    <p className="text-sm font-semibold">
                      {item.order}. {item.element.nome || item.element.descrizione}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {item.element.id} · {item.element.valore} · gruppo{" "}
                      {item.element.gruppo.numero}
                    </p>
                  </div>
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-semibold">
                    {item.role}
                  </span>
                </div>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {item.element.descrizione}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
