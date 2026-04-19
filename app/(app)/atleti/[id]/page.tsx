import Link from "next/link";

import { DeleteAthleteButton } from "@/components/athletes/delete-athlete-button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatItalianDate } from "@/lib/date";
import { AthletesStorageNotReadyError } from "@/lib/athletes/errors";
import { getAthleteForCoach } from "@/lib/athletes/service";
import { requireSession } from "@/lib/session";

interface AthleteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AthleteDetailPage({ params }: AthleteDetailPageProps) {
  const session = await requireSession();
  const { id } = await params;
  let athlete = null;

  try {
    athlete = await getAthleteForCoach(id, session.user.id);
  } catch (error) {
    if (error instanceof AthletesStorageNotReadyError) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Database atleti non pronto</CardTitle>
            <CardDescription>
              Prima di aprire un profilo devi applicare la migration degli atleti.
            </CardDescription>
          </CardHeader>
        </Card>
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
        <Link href="/atleti" className={buttonVariants({ variant: "outline" })}>
          Torna alla lista
        </Link>
      </div>
    );
  }

  const fullName = `${athlete.firstName} ${athlete.lastName}`;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="grid gap-2">
          <Link href="/atleti" className={buttonVariants({ variant: "outline" })}>
            Torna agli atleti
          </Link>
          <h2 className="text-foreground text-2xl font-bold tracking-tight">{fullName}</h2>
          <p className="text-muted-foreground text-sm">
            Nato il {formatItalianDate(athlete.birthDate)} · aggiornato il{" "}
            {formatItalianDate(athlete.updatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/atleti/${athlete.id}/modifica`}
            className={buttonVariants({ variant: "outline" })}
          >
            Modifica
          </Link>
          <DeleteAthleteButton athleteId={athlete.id} athleteName={fullName} />
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dati atleta</CardTitle>
          <CardDescription>Informazioni gestite dal tecnico.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <div className="grid gap-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Nome
            </p>
            <p className="font-medium">{athlete.firstName}</p>
          </div>
          <div className="grid gap-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Cognome
            </p>
            <p className="font-medium">{athlete.lastName}</p>
          </div>
          <div className="grid gap-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Data di nascita
            </p>
            <p className="font-medium">{formatItalianDate(athlete.birthDate)}</p>
          </div>
          <div className="grid gap-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Numero tessera
            </p>
            <p className="font-medium">{athlete.tesseraNumber ?? "Non inserito"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
