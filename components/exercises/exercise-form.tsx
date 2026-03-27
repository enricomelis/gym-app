"use client";

import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import { createExercise, updateExercise } from "@/app/actions/exercises";
import { CdpElementoDialog } from "@/components/cdp/cdp-elemento-dialog";
import { CdpElementPreview } from "@/components/cdp/cdp-element-preview";
import {
  COLORI_GRUPPO,
  NUMERI_ROMANI,
  coloreDifficolta,
  etichettaDifficolta,
  ATTREZZI,
  titoloElemento,
} from "@/components/cdp/cdp-constants";
import { ExerciseCatalog } from "@/components/exercises/exercise-catalog";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCatalogByAttrezzo } from "@/lib/cdp/catalog";
import {
  insertElement,
  markElementAsExit,
  moveElement,
  normalizeComposition,
  removeElement,
} from "@/lib/exercises/composition";
import { calculateDScore } from "@/lib/exercises/d-score";
import { resolveExerciseElements } from "@/lib/exercises/rules";
import type { Attrezzo } from "@/lib/types/cdp";
import type { ExerciseDetail, ExerciseInput } from "@/lib/types/exercise";
import { cn } from "@/lib/utils";

interface ExerciseFormProps {
  initialData?: ExerciseDetail;
}

type FieldErrors = Record<string, string[]>;

function getInitialInput(initialData?: ExerciseDetail) {
  if (!initialData) {
    return {
      name: "",
      attrezzo: "CL" as Attrezzo,
      notes: "",
      elements: [],
      manualExitElementId: null as string | null,
    };
  }

  const manualExitElement = initialData.elements.find((element) => element.role === "USCITA");

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
    manualExitElementId: manualExitElement?.elementId ?? null,
  };
}

export function ExerciseForm({ initialData }: ExerciseFormProps) {
  const router = useRouter();
  const initialInput = useMemo(() => getInitialInput(initialData), [initialData]);

  const [form, setForm] = useState({
    name: initialInput.name,
    attrezzo: initialInput.attrezzo,
    notes: initialInput.notes,
    elements: initialInput.elements,
  });
  const [manualExitElementId, setManualExitElementId] = useState<string | null>(
    initialInput.manualExitElementId,
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isPending, setIsPending] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const composition = useMemo(
    () => normalizeComposition(form.attrezzo, form.elements, manualExitElementId),
    [form.attrezzo, form.elements, manualExitElementId],
  );

  const availableCatalogElements = useMemo(() => {
    const selectedIds = new Set(composition.elements.map((element) => element.elementId));
    return getCatalogByAttrezzo(form.attrezzo).filter((element) => !selectedIds.has(element.id));
  }, [composition.elements, form.attrezzo]);

  const resolvedElements = useMemo(() => {
    try {
      return resolveExerciseElements({
        name: form.name,
        attrezzo: form.attrezzo,
        notes: form.notes,
        elements: composition.elements,
      });
    } catch {
      return [];
    }
  }, [composition.elements, form.attrezzo, form.name, form.notes]);

  const dScore = useMemo(() => {
    if (resolvedElements.length === 0) {
      return 0;
    }

    return calculateDScore(form.attrezzo, resolvedElements);
  }, [form.attrezzo, resolvedElements]);

  const selectedElement = useMemo(() => {
    if (!selectedElementId) {
      return null;
    }

    return resolvedElements.find((item) => item.elementId === selectedElementId)?.element ?? null;
  }, [resolvedElements, selectedElementId]);

  function setFieldErrorState(errorMap?: FieldErrors) {
    setFieldErrors(errorMap ?? {});
  }

  function updateComposition(next: {
    elements: typeof composition.elements;
    manualExitElementId: string | null;
  }) {
    setForm((current) => ({
      ...current,
      elements: next.elements,
    }));
    setManualExitElementId(next.manualExitElementId);
  }

  function handleAttrezzoChange(attrezzo: Attrezzo) {
    setForm({
      name: form.name,
      attrezzo,
      notes: form.notes,
      elements: [],
    });
    setManualExitElementId(null);
    setServerError(null);
    setFieldErrorState();
  }

  function addElement(elementId: string) {
    if (form.attrezzo === "VT" && composition.elements.length >= 2) {
      setServerError("Il volteggio accetta uno o due salti.");
      return;
    }

    if (form.attrezzo !== "VT" && composition.elements.length >= 8) {
      setServerError("Gli esercizi possono contenere al massimo otto elementi.");
      return;
    }

    setServerError(null);
    updateComposition(
      insertElement(
        form.attrezzo,
        {
          elements: composition.elements,
          manualExitElementId,
        },
        {
          elementId,
          order: composition.elements.length + 1,
          role: form.attrezzo === "VT" ? "VOLTEGGIO" : "STANDARD",
          notes: "",
        },
      ),
    );
  }

  function removeElementAt(index: number) {
    updateComposition(
      removeElement(
        form.attrezzo,
        {
          elements: composition.elements,
          manualExitElementId,
        },
        index,
      ),
    );
  }

  function moveElementAt(index: number, direction: -1 | 1) {
    updateComposition(
      moveElement(
        form.attrezzo,
        {
          elements: composition.elements,
          manualExitElementId,
        },
        index,
        direction,
      ),
    );
  }

  function markExitAt(index: number) {
    updateComposition(
      markElementAsExit(
        form.attrezzo,
        {
          elements: composition.elements,
          manualExitElementId,
        },
        index,
      ),
    );
  }

  function getElementLabel(index: number) {
    const item = resolvedElements[index];
    if (!item) {
      return `elemento ${index + 1}`;
    }

    return titoloElemento(item.element);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    setFieldErrorState();
    setIsPending(true);

    const payload: ExerciseInput = {
      name: form.name.trim(),
      attrezzo: form.attrezzo,
      notes: form.notes?.trim() || null,
      elements: composition.elements.map((element, index) => ({
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
            Componi l&apos;esercizio selezionando gli elementi dal CdP e controlla la nota D in
            tempo reale.
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
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
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
                : "La nota D somma il valore degli elementi e 0,5 punti per ogni gruppo strutturale presente (1-4)."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Catalogo elementi</CardTitle>
            <CardDescription>
              Usa una vista ridotta del CdP: click sull&apos;elemento per il dettaglio, click su
              “Aggiungi” per inserirlo nella composizione.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExerciseCatalog
              elements={availableCatalogElements}
              onAddElement={addElement}
              addDisabled={
                form.attrezzo === "VT"
                  ? composition.elements.length >= 2
                  : composition.elements.length >= 8
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composizione</CardTitle>
            <CardDescription>
              L&apos;uscita è sempre l&apos;ultimo elemento. Se ne scegli una diversa, viene
              spostata in fondo automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {resolvedElements.map((item, index) => (
              <div
                key={`${item.elementId}-${item.order}`}
                className="grid gap-3 rounded-xl border p-3"
              >
                <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3">
                  <button
                    type="button"
                    className="contents text-left"
                    onClick={() => setSelectedElementId(item.elementId)}
                  >
                    <CdpElementPreview element={item.element} />
                    <div className="grid gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-muted-foreground font-mono text-xs">
                          {item.order}.
                        </span>
                        <span
                          className="rounded-full px-2 py-1 text-[11px] font-semibold"
                          style={{
                            backgroundColor: COLORI_GRUPPO[item.element.gruppo.numero],
                            color: "#000",
                          }}
                        >
                          Gruppo {NUMERI_ROMANI[item.element.gruppo.numero]}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold",
                            coloreDifficolta(item.element.valore),
                          )}
                        >
                          {etichettaDifficolta(item.element.valore)}
                        </span>
                        {item.role === "USCITA" && (
                          <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-[11px] font-semibold">
                            Uscita
                          </span>
                        )}
                      </div>
                      <div className="grid gap-1">
                        <p className="text-sm font-semibold">{titoloElemento(item.element)}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {item.element.descrizione}
                        </p>
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => moveElementAt(index, -1)}
                      disabled={index === 0}
                      aria-label={`Sposta su ${getElementLabel(index)}`}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => moveElementAt(index, 1)}
                      disabled={index === resolvedElements.length - 1}
                      aria-label={`Sposta giù ${getElementLabel(index)}`}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => removeElementAt(index)}
                      aria-label={`Rimuovi ${getElementLabel(index)}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {form.attrezzo !== "VT" && (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => markExitAt(index)}
                      aria-label={`Imposta come uscita ${getElementLabel(index)}`}
                      className={buttonVariants({
                        size: "sm",
                        variant: item.role === "USCITA" ? "secondary" : "outline",
                      })}
                    >
                      Imposta come uscita
                    </button>
                    {item.role === "USCITA" && (
                      <p className="text-muted-foreground text-xs">
                        Premendo su un altro elemento, quello verrà spostato in fondo e diventerà la
                        nuova uscita.
                      </p>
                    )}
                  </div>
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
                  Aggiungi gli elementi dal catalogo per costruire l&apos;esercizio.
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

      <CdpElementoDialog elemento={selectedElement} onClose={() => setSelectedElementId(null)} />
    </form>
  );
}
