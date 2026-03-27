"use client";

import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { createExercise, updateExercise } from "@/app/actions/exercises";
import { getCatalogByAttrezzo } from "@/lib/cdp/catalog";
import { calculateDScore } from "@/lib/exercises/d-score";
import { resolveExerciseElements } from "@/lib/exercises/rules";
import type { Attrezzo } from "@/lib/types/cdp";
import type { ExerciseDetail, ExerciseElementInput, ExerciseInput } from "@/lib/types/exercise";
import { ATTREZZI, titoloElemento } from "@/components/cdp/cdp-constants";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExerciseFormProps {
  initialData?: ExerciseDetail;
}

type FieldErrors = Record<string, string[]>;

function nextRole(attrezzo: Attrezzo): ExerciseElementInput["role"] {
  if (attrezzo === "VT") {
    return "VOLTEGGIO";
  }

  return "STANDARD";
}

function normalizeElementRoles(
  attrezzo: Attrezzo,
  elements: ExerciseElementInput[],
): ExerciseElementInput[] {
  if (attrezzo === "VT") {
    return elements.map((element, index) => ({
      ...element,
      order: index + 1,
      role: "VOLTEGGIO",
    }));
  }

  return elements.map((element, index) => ({
    ...element,
    order: index + 1,
    role: elements.length === 8 && index === elements.length - 1 ? "USCITA" : "STANDARD",
  }));
}

function moveElementToExitPosition(elements: ExerciseElementInput[], index: number) {
  const nextItems = [...elements];
  const [selected] = nextItems.splice(index, 1);

  if (!selected) {
    return elements;
  }

  nextItems.push(selected);
  return nextItems;
}

function getInitialInput(initialData?: ExerciseDetail): ExerciseInput {
  if (!initialData) {
    return {
      name: "",
      attrezzo: "CL",
      notes: "",
      elements: [],
    };
  }

  return {
    name: initialData.name,
    attrezzo: initialData.attrezzo,
    notes: initialData.notes ?? "",
    elements: initialData.elements.map((element) => ({
      elementId: element.elementId,
      order: element.order,
      role: element.role,
      notes: element.notes ?? "",
    })),
  };
}

export function ExerciseForm({ initialData }: ExerciseFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ExerciseInput>(() => getInitialInput(initialData));
  const [query, setQuery] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isPending, setIsPending] = useState(false);

  const catalog = useMemo(() => getCatalogByAttrezzo(form.attrezzo), [form.attrezzo]);

  const availableElements = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return catalog.filter((element) => {
      const alreadyAdded = form.elements.some((item) => item.elementId === element.id);
      if (alreadyAdded) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [element.id, element.nome, element.descrizione, element.valore].join(" ");
      return haystack.toLowerCase().includes(normalizedQuery);
    });
  }, [catalog, form.elements, query]);

  const resolvedElements = useMemo(() => {
    try {
      return resolveExerciseElements(form);
    } catch {
      return [];
    }
  }, [form]);

  const dScore = useMemo(() => {
    if (resolvedElements.length === 0) {
      return 0;
    }

    return calculateDScore(resolvedElements);
  }, [resolvedElements]);

  function setFieldErrorState(errorMap?: FieldErrors) {
    setFieldErrors(errorMap ?? {});
  }

  function handleAttrezzoChange(attrezzo: Attrezzo) {
    setForm({
      name: form.name,
      attrezzo,
      notes: form.notes,
      elements: [],
    });
    setQuery("");
    setServerError(null);
    setFieldErrorState();
  }

  function addElement(elementId: string) {
    if (form.attrezzo === "VT" && form.elements.length >= 2) {
      setServerError("Il volteggio accetta uno o due salti.");
      return;
    }

    if (form.attrezzo !== "VT" && form.elements.length >= 8) {
      setServerError("Gli esercizi possono contenere al massimo otto elementi.");
      return;
    }

    setServerError(null);
    setForm((current) => ({
      ...current,
      elements: normalizeElementRoles(current.attrezzo, [
        ...current.elements,
        {
          elementId,
          order: current.elements.length + 1,
          role: nextRole(current.attrezzo),
          notes: "",
        },
      ]),
    }));
  }

  function removeElement(index: number) {
    setForm((current) => ({
      ...current,
      elements: normalizeElementRoles(
        current.attrezzo,
        current.elements.filter((_, currentIndex) => currentIndex !== index),
      ),
    }));
  }

  function moveElement(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= form.elements.length) {
      return;
    }

    setForm((current) => {
      const nextItems = [...current.elements];
      [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];
      return {
        ...current,
        elements: normalizeElementRoles(current.attrezzo, nextItems),
      };
    });
  }

  function updateNotes(notes: string) {
    setForm((current) => ({ ...current, notes }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    setFieldErrorState();
    setIsPending(true);

    const payload: ExerciseInput = {
      ...form,
      name: form.name.trim(),
      notes: form.notes?.trim() || null,
      elements: form.elements.map((element, index) => ({
        ...element,
        order: index + 1,
        notes: element.notes?.trim() || null,
      })),
    };

    startTransition(async () => {
      const result = initialData
        ? await updateExercise(initialData.id, payload)
        : await createExercise(payload);

      if (!result.success) {
        setServerError(result.error ?? null);
        setFieldErrorState(result.fieldErrors);
        setIsPending(false);
        return;
      }

      router.refresh();
      router.push(initialData ? `/esercizi/${initialData.id}` : `/esercizi/${result.exerciseId}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? "Modifica esercizio" : "Nuovo esercizio"}</CardTitle>
          <CardDescription>
            Componi l'esercizio selezionando gli elementi dal CdP e controlla la nota D in tempo
            reale.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {serverError && (
            <div className="bg-destructive/10 border-l-destructive flex items-start gap-3 rounded-lg border border-destructive/20 border-l-4 p-4">
              <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
              <p className="text-destructive text-sm font-medium">{serverError}</p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="exercise-name">Nome esercizio</Label>
            <Input
              id="exercise-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              aria-invalid={fieldErrors.name ? true : undefined}
            />
            {fieldErrors.name && <p className="text-destructive text-sm">{fieldErrors.name[0]}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="exercise-attrezzo">Attrezzo</Label>
            <select
              id="exercise-attrezzo"
              className="border-input bg-background h-10 rounded-lg border px-3 text-sm"
              value={form.attrezzo}
              onChange={(event) => handleAttrezzoChange(event.target.value as Attrezzo)}
            >
              {ATTREZZI.map((attrezzo) => (
                <option key={attrezzo.codice} value={attrezzo.codice}>
                  {attrezzo.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="exercise-notes">Note</Label>
            <Textarea
              id="exercise-notes"
              value={form.notes ?? ""}
              onChange={(event) => updateNotes(event.target.value)}
              aria-invalid={fieldErrors.notes ? true : undefined}
            />
            {fieldErrors.notes && (
              <p className="text-destructive text-sm">{fieldErrors.notes[0]}</p>
            )}
          </div>

          <div className="grid gap-2 rounded-xl border bg-muted/30 p-4">
            <p className="text-sm font-medium">Nota D attuale</p>
            <p className="text-3xl font-bold tracking-tight">{dScore.toFixed(3)}</p>
            <p className="text-muted-foreground text-sm">
              {form.attrezzo === "VT"
                ? "Il volteggio accetta uno o due salti."
                : "L'uscita diventa selezionabile solo quando la composizione arriva a otto elementi."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Catalogo elementi</CardTitle>
            <CardDescription>
              Cerca nel codice dell'attrezzo selezionato e aggiungi gli elementi alla composizione.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cerca per codice, nome o descrizione"
            />

            <div className="grid max-h-[28rem] gap-3 overflow-y-auto pr-1">
              {availableElements.slice(0, 60).map((element) => (
                <button
                  key={element.id}
                  type="button"
                  onClick={() => addElement(element.id)}
                  className="hover:border-primary/50 hover:bg-accent/40 flex items-start justify-between rounded-xl border p-3 text-left transition-colors"
                >
                  <div className="grid gap-1">
                    <p className="text-sm font-semibold">{titoloElemento(element)}</p>
                    <p className="text-muted-foreground text-xs">{element.id}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {element.descrizione}
                    </p>
                  </div>
                  <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold">
                    {element.valore}
                    <Plus className="size-3" />
                  </span>
                </button>
              ))}

              {availableElements.length === 0 && (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <p className="text-sm font-medium">Nessun elemento disponibile</p>
                  <p className="text-muted-foreground text-sm">
                    Modifica la ricerca o rimuovi qualche elemento già selezionato.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composizione</CardTitle>
            <CardDescription>
              Ordina gli elementi e, fuori dal volteggio, marca l'uscita quando serve.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {resolvedElements.map((item, index) => (
              <div
                key={`${item.elementId}-${item.order}`}
                className="grid gap-3 rounded-xl border p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {item.order}. {titoloElemento(item.element)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {item.element.id} · {item.element.valore}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => moveElement(index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => moveElement(index, 1)}
                      disabled={index === resolvedElements.length - 1}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => removeElement(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {form.attrezzo !== "VT" && form.elements.length === 8 && index === 7 && (
                  <p className="bg-primary/10 text-primary inline-flex w-fit rounded-full px-2 py-1 text-xs font-semibold">
                    Uscita automatica
                  </p>
                )}

                {form.attrezzo !== "VT" && form.elements.length === 8 && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.role === "USCITA"}
                      disabled={item.role === "USCITA"}
                      onChange={(event) => {
                        if (!event.target.checked) {
                          return;
                        }

                        setForm((current) => ({
                          ...current,
                          elements: normalizeElementRoles(
                            current.attrezzo,
                            moveElementToExitPosition(current.elements, index),
                          ),
                        }));
                      }}
                    />
                    Imposta come uscita
                  </label>
                )}
              </div>
            ))}

            {fieldErrors.elements && (
              <p className="text-destructive text-sm">{fieldErrors.elements[0]}</p>
            )}

            {resolvedElements.length === 0 && (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <p className="text-sm font-medium">Nessun elemento selezionato</p>
                <p className="text-muted-foreground text-sm">
                  Aggiungi gli elementi dal catalogo per costruire l'esercizio.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href={initialData ? `/esercizi/${initialData.id}` : "/esercizi"}
          className={buttonVariants({ variant: "outline" })}
        >
          Annulla
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? initialData
              ? "Salvataggio..."
              : "Creazione..."
            : initialData
              ? "Salva modifiche"
              : "Crea esercizio"}
        </Button>
      </div>
    </form>
  );
}
