"use client";

import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { createAthlete, updateAthlete } from "@/app/actions/athletes";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toDateInputValue } from "@/lib/athletes/rules";
import type { AthleteDetail, AthleteInput } from "@/lib/types/athlete";

interface AthleteFormProps {
  initialData?: AthleteDetail;
  closeHref?: string;
}

type FieldErrors = Record<string, string[]>;

function getInitialInput(initialData?: AthleteDetail) {
  if (!initialData) {
    return {
      firstName: "",
      lastName: "",
      birthDate: "",
      tesseraNumber: "",
    };
  }

  return {
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    birthDate: toDateInputValue(initialData.birthDate),
    tesseraNumber: initialData.tesseraNumber ?? "",
  };
}

export function AthleteForm({ initialData, closeHref }: AthleteFormProps) {
  const router = useRouter();
  const initialInput = useMemo(() => getInitialInput(initialData), [initialData]);
  const resolvedCloseHref = closeHref ?? (initialData ? `/atleti/${initialData.id}` : "/atleti");
  const [form, setForm] = useState(initialInput);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    setFieldErrors({});
    setIsPending(true);

    const payload: AthleteInput = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      birthDate: form.birthDate,
      tesseraNumber: form.tesseraNumber.trim() || null,
    };

    startTransition(async () => {
      const result = initialData
        ? await updateAthlete(initialData.id, payload)
        : await createAthlete(payload);

      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        setServerError(result.error ?? result.fieldErrors?.root?.[0] ?? null);
        setIsPending(false);
        return;
      }

      router.refresh();
      router.push(initialData ? `/atleti/${initialData.id}` : `/atleti/${result.athleteId}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? "Dati atleta" : "Nuovo profilo atleta"}</CardTitle>
          <CardDescription>
            Inserisci i dati anagrafici usati dal tecnico per riconoscere l'atleta.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {serverError && (
            <div className="bg-destructive/10 border-l-destructive flex items-start gap-3 rounded-lg border border-destructive/20 border-l-4 p-3">
              <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
              <p className="text-destructive text-sm font-medium">{serverError}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="athlete-first-name">Nome</Label>
              <Input
                id="athlete-first-name"
                value={form.firstName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, firstName: event.target.value }))
                }
                aria-invalid={fieldErrors.firstName ? true : undefined}
                autoComplete="given-name"
              />
              {fieldErrors.firstName && (
                <p className="text-destructive text-sm">{fieldErrors.firstName[0]}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="athlete-last-name">Cognome</Label>
              <Input
                id="athlete-last-name"
                value={form.lastName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, lastName: event.target.value }))
                }
                aria-invalid={fieldErrors.lastName ? true : undefined}
                autoComplete="family-name"
              />
              {fieldErrors.lastName && (
                <p className="text-destructive text-sm">{fieldErrors.lastName[0]}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="athlete-birth-date">Data di nascita</Label>
              <Input
                id="athlete-birth-date"
                type="date"
                value={form.birthDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, birthDate: event.target.value }))
                }
                aria-invalid={fieldErrors.birthDate ? true : undefined}
              />
              {fieldErrors.birthDate && (
                <p className="text-destructive text-sm">{fieldErrors.birthDate[0]}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="athlete-tessera-number">Numero tessera</Label>
              <Input
                id="athlete-tessera-number"
                value={form.tesseraNumber}
                onChange={(event) =>
                  setForm((current) => ({ ...current, tesseraNumber: event.target.value }))
                }
                aria-invalid={fieldErrors.tesseraNumber ? true : undefined}
                placeholder="Opzionale"
              />
              {fieldErrors.tesseraNumber && (
                <p className="text-destructive text-sm">{fieldErrors.tesseraNumber[0]}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
            <Link href={resolvedCloseHref} className={buttonVariants({ variant: "outline" })}>
              Annulla
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? initialData
                  ? "Salvataggio..."
                  : "Creazione..."
                : initialData
                  ? "Salva modifiche"
                  : "Crea atleta"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
