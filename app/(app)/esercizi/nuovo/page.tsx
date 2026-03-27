import { ExerciseFormShell } from "@/components/exercises/exercise-form-shell";
import { requireSession } from "@/lib/session";

export default async function NewExercisePage() {
  const session = await requireSession();

  if (session.user.role !== "TECNICO") {
    return (
      <div className="grid gap-4">
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Nuovo esercizio</h2>
        <p className="text-muted-foreground">
          In questa prima versione solo i tecnici possono creare esercizi.
        </p>
      </div>
    );
  }

  return (
    <ExerciseFormShell
      title="Nuovo esercizio"
      description="Seleziona l'attrezzo, componi gli elementi e salva la tua bozza tecnica."
    />
  );
}
