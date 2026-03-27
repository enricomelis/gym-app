import { BackToExercisesButton } from "@/components/exercises/back-to-exercises-button";
import { ExerciseForm } from "@/components/exercises/exercise-form";
import { ExercisesStorageNotReadyError } from "@/lib/exercises/errors";
import { getExerciseForUser } from "@/lib/exercises/service";
import { requireSession } from "@/lib/session";

interface EditExercisePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExercisePage({ params }: EditExercisePageProps) {
  const session = await requireSession();

  if (session.user.role !== "TECNICO") {
    return (
      <div className="grid gap-4">
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Modifica esercizio</h2>
        <p className="text-muted-foreground">
          In questa prima versione solo i tecnici possono modificare esercizi.
        </p>
      </div>
    );
  }

  const { id } = await params;
  let exercise = null;

  try {
    exercise = await getExerciseForUser(id, session.user.id);
  } catch (error) {
    if (error instanceof ExercisesStorageNotReadyError) {
      return (
        <div className="grid gap-4">
          <h2 className="text-foreground text-2xl font-bold tracking-tight">Modifica esercizio</h2>
          <p className="text-muted-foreground">
            Applica prima la migration Prisma degli esercizi per usare questa pagina.
          </p>
        </div>
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
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <BackToExercisesButton />
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Modifica esercizio</h2>
        <p className="text-muted-foreground text-sm">
          Aggiorna composizione, note e ordine degli elementi.
        </p>
      </div>
      <ExerciseForm initialData={exercise} />
    </div>
  );
}
