import Link from "next/link";

import { formatItalianDate } from "@/lib/date";
import { ExercisesStorageNotReadyError } from "@/lib/exercises/errors";
import { listExercisesForUser } from "@/lib/exercises/service";
import { requireSession } from "@/lib/session";
import { ATTREZZI } from "@/components/cdp/cdp-constants";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ExercisesPageProps {
  searchParams: Promise<{ attrezzo?: string }>;
}

export default async function ExercisesPage({ searchParams }: ExercisesPageProps) {
  const session = await requireSession();
  const { attrezzo } = await searchParams;

  if (session.user.role !== "TECNICO") {
    return (
      <div className="grid gap-4">
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Esercizi</h2>
        <p className="text-muted-foreground">
          In questa prima versione gli esercizi sono gestibili solo dai tecnici.
        </p>
      </div>
    );
  }

  try {
    const exercises = await listExercisesForUser(
      session.user.id,
      attrezzo && ATTREZZI.some((item) => item.codice === attrezzo) ? attrezzo : undefined,
    );

    return (
      <div className="grid gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-foreground text-2xl font-bold tracking-tight">Esercizi</h2>
            <p className="text-muted-foreground text-sm">
              Crea e aggiorna le composizioni dei tuoi atleti partendo dal CdP.
            </p>
          </div>
          <Link href="/esercizi/nuovo" className={buttonVariants()}>
            Nuovo esercizio
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/esercizi"
            className={buttonVariants({ variant: !attrezzo ? "default" : "outline" })}
          >
            Tutti
          </Link>
          {ATTREZZI.map((item) => (
            <Link
              key={item.codice}
              href={`/esercizi?attrezzo=${item.codice}`}
              className={buttonVariants({
                variant: attrezzo === item.codice ? "default" : "outline",
              })}
            >
              {item.nome}
            </Link>
          ))}
        </div>

        {exercises.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {exercises.map((exercise) => (
              <Card key={exercise.id}>
                <CardHeader>
                  <CardTitle>{exercise.name}</CardTitle>
                  <CardDescription>
                    {exercise.attrezzo} · {exercise.elementCount} element
                    {exercise.elementCount === 1 ? "o" : "i"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-1 rounded-xl border bg-muted/30 p-3">
                    <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">
                      Nota D
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {exercise.dScore.toFixed(3)}
                    </p>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Aggiornato il {formatItalianDate(exercise.updatedAt)}
                  </p>
                  <Link
                    href={`/esercizi/${exercise.id}`}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Apri dettaglio
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Nessun esercizio salvato</CardTitle>
              <CardDescription>
                Inizia creando il primo esercizio per salvare una composizione.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/esercizi/nuovo" className={buttonVariants()}>
                Crea il primo esercizio
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    if (!(error instanceof ExercisesStorageNotReadyError)) {
      throw error;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Database esercizi non pronto</CardTitle>
          <CardDescription>
            La feature e installata, ma il database corrente non ha ancora la migration degli
            esercizi.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <p className="text-muted-foreground text-sm">
            Applica la migration Prisma per creare le tabelle `Exercise` ed `ExerciseElement`, poi
            ricarica la pagina.
          </p>
          <code className="bg-muted rounded-lg px-3 py-2 text-xs">bunx prisma migrate deploy</code>
        </CardContent>
      </Card>
    );
  }
}
