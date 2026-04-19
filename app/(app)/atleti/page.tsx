import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatItalianDate } from "@/lib/date";
import { AthletesStorageNotReadyError } from "@/lib/athletes/errors";
import { listAthletesForCoach } from "@/lib/athletes/service";
import { requireSession } from "@/lib/session";

export default async function AthletesPage() {
  const session = await requireSession();

  if (session.user.role !== "TECNICO") {
    return (
      <div className="grid gap-4">
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Atleti</h2>
        <p className="text-muted-foreground">
          In questa prima versione i profili atleta sono gestibili solo dai tecnici.
        </p>
      </div>
    );
  }

  try {
    const athletes = await listAthletesForCoach(session.user.id);

    return (
      <div className="grid gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-foreground text-2xl font-bold tracking-tight">Atleti</h2>
            <p className="text-muted-foreground text-sm">
              Crea e aggiorna i profili degli atleti seguiti dal tuo account tecnico.
            </p>
          </div>
          <Link href="/atleti/nuovo" className={buttonVariants()}>
            Nuovo atleta
          </Link>
        </div>

        {athletes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {athletes.map((athlete) => {
              const fullName = `${athlete.firstName} ${athlete.lastName}`;
              return (
                <Card key={athlete.id}>
                  <CardHeader>
                    <CardTitle>{fullName}</CardTitle>
                    <CardDescription>
                      Nato il {formatItalianDate(athlete.birthDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-1 rounded-lg border bg-muted/30 p-3">
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                        Numero tessera
                      </p>
                      <p className="font-medium">{athlete.tesseraNumber ?? "Non inserito"}</p>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Aggiornato il {formatItalianDate(athlete.updatedAt)}
                    </p>
                    <Link
                      href={`/atleti/${athlete.id}`}
                      className={buttonVariants({ variant: "outline" })}
                    >
                      Apri profilo
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Nessun atleta salvato</CardTitle>
              <CardDescription>
                Crea il primo profilo atleta per iniziare a organizzare il lavoro tecnico.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/atleti/nuovo" className={buttonVariants()}>
                Crea il primo atleta
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    if (!(error instanceof AthletesStorageNotReadyError)) {
      throw error;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Database atleti non pronto</CardTitle>
          <CardDescription>
            La feature e installata, ma il database corrente non ha ancora la migration degli
            atleti.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <p className="text-muted-foreground text-sm">
            Applica la migration Prisma per creare la tabella `Athlete`, poi ricarica la pagina.
          </p>
          <code className="bg-muted rounded-lg px-3 py-2 text-xs">bunx prisma migrate deploy</code>
        </CardContent>
      </Card>
    );
  }
}
