import { AthleteForm } from "@/components/athletes/athlete-form";
import { requireSession } from "@/lib/session";

export default async function NewAthletePage() {
  const session = await requireSession();

  if (session.user.role !== "TECNICO") {
    return (
      <div className="grid gap-4">
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Nuovo atleta</h2>
        <p className="text-muted-foreground">
          In questa prima versione solo i tecnici possono creare profili atleta.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Nuovo atleta</h2>
        <p className="text-muted-foreground text-sm">
          Crea il profilo dell'atleta che verra gestito dal tuo account tecnico.
        </p>
      </div>
      <AthleteForm />
    </div>
  );
}
