import { AthleteForm } from "@/components/athletes/athlete-form";
import { AthletesStorageNotReadyError } from "@/lib/athletes/errors";
import { getAthleteForCoach } from "@/lib/athletes/service";
import { requireSession } from "@/lib/session";

interface EditAthletePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAthletePage({ params }: EditAthletePageProps) {
  const session = await requireSession();

  if (session.user.role !== "TECNICO") {
    return (
      <div className="grid gap-4">
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Modifica atleta</h2>
        <p className="text-muted-foreground">
          In questa prima versione solo i tecnici possono modificare profili atleta.
        </p>
      </div>
    );
  }

  const { id } = await params;
  let athlete = null;

  try {
    athlete = await getAthleteForCoach(id, session.user.id);
  } catch (error) {
    if (error instanceof AthletesStorageNotReadyError) {
      return (
        <div className="grid gap-4">
          <h2 className="text-foreground text-2xl font-bold tracking-tight">Modifica atleta</h2>
          <p className="text-muted-foreground">
            Applica prima la migration Prisma degli atleti per usare questa pagina.
          </p>
        </div>
      );
    }

    throw error;
  }

  if (!athlete) {
    return (
      <div className="grid gap-4">
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Atleta non trovato</h2>
        <p className="text-muted-foreground">
          Il profilo richiesto non esiste o non appartiene al tecnico corrente.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Modifica atleta</h2>
        <p className="text-muted-foreground text-sm">
          Aggiorna i dati anagrafici gestiti dal tuo account tecnico.
        </p>
      </div>
      <AthleteForm initialData={athlete} />
    </div>
  );
}
