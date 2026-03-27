"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
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
import { KeyboardShortcutHint } from "@/components/ui/keyboard-shortcut-hint";
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
  closeHref?: string;
  onDirtyChange?: (isDirty: boolean) => void;
  onRequestClose?: () => void;
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

function getInputSnapshot(input: {
  name: string;
  attrezzo: Attrezzo;
  notes: string;
  elements: {
    elementId: string;
    order: number;
    role: "STANDARD" | "USCITA" | "VOLTEGGIO";
    notes: string;
  }[];
  manualExitElementId: string | null;
}) {
  return JSON.stringify({
    name: input.name,
    attrezzo: input.attrezzo,
    notes: input.notes,
    elements: input.elements.map((element) => ({
      elementId: element.elementId,
      order: element.order,
      role: element.role,
      notes: element.notes,
    })),
    manualExitElementId: input.manualExitElementId,
  });
}

export function ExerciseForm({
  initialData,
  closeHref,
  onDirtyChange,
  onRequestClose,
}: ExerciseFormProps) {
  const router = useRouter();
  const initialInput = useMemo(() => getInitialInput(initialData), [initialData]);
  const resolvedCloseHref = closeHref ?? (initialData ? `/esercizi/${initialData.id}` : "/esercizi");

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
  const initialSnapshot = useMemo(() => getInputSnapshot(initialInput), [initialInput]);

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

  const isDirty = useMemo(() => {
    return (
      getInputSnapshot({
        name: form.name,
        attrezzo: form.attrezzo,
        notes: form.notes,
        elements: form.elements,
        manualExitElementId,
      }) !== initialSnapshot
    );
  }, [form.attrezzo, form.elements, form.name, form.notes, initialSnapshot, manualExitElementId]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(18rem,0.45fr)] xl:items-start">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Metadati</CardTitle>
            <CardDescription>
              Nome, attrezzo e note rapide dell&apos;esercizio.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(12rem,0.45fr)_minmax(0,1fr)] lg:items-start">
              <div className="grid gap-2">
                <Label htmlFor="exercise-name">Nome esercizio</Label>
                <Input
                  id="exercise-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  aria-invalid={fieldErrors.name ? true : undefined}
                />
                {fieldErrors.name && (
                  <p className="text-destructive text-sm">{fieldErrors.name[0]}</p>
                )}
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
                  className="min-h-10 lg:min-h-full"
                />
                {fieldErrors.notes && (
                  <p className="text-destructive text-sm">{fieldErrors.notes[0]}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Nota D</CardTitle>
            <CardDescription>Aggiornata in tempo reale durante la composizione.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-medium">Valore attuale</p>
              <p className="text-3xl font-bold tracking-tight">{dScore.toFixed(3)}</p>
              <p className="text-muted-foreground text-sm">
                {form.attrezzo === "VT"
                  ? "Il volteggio accetta uno o due salti."
                  : "La nota D somma il valore degli elementi e 0,5 punti per ogni gruppo strutturale presente (1-4)."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Composizione</CardTitle>
          <CardDescription>
            Costruisci l&apos;esercizio in ordine sequenziale e controlla subito la struttura finale.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {serverError && (
            <div className="bg-destructive/10 border-l-destructive flex items-start gap-3 rounded-lg border border-destructive/20 border-l-4 p-4">
              <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
              <p className="text-destructive text-sm font-medium">{serverError}</p>
            </div>
          )}

          {resolvedElements.length > 0 && (
            <div className="-mx-1 overflow-x-auto pb-2">
              <div className="flex min-w-max gap-3 px-1">
                {resolvedElements.map((item, index) => (
                  <div
                    key={`${item.elementId}-${item.order}`}
                    className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        className="grid min-w-0 gap-2 text-left"
                        onClick={() => setSelectedElementId(item.elementId)}
                      >
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
                          <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
                            {item.element.descrizione}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        className="rounded-lg"
                        onClick={() => setSelectedElementId(item.elementId)}
                        aria-label={`Apri dettaglio ${getElementLabel(index)}`}
                      >
                        <CdpElementPreview element={item.element} size="xs" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center gap-1">
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
                      {form.attrezzo !== "VT" && item.role !== "USCITA" && (
                        <button
                          type="button"
                          onClick={() => markExitAt(index)}
                          aria-label={`Imposta come uscita ${getElementLabel(index)}`}
                          className={buttonVariants({
                            size: "sm",
                            variant: "outline",
                          })}
                        >
                          Segna uscita
                        </button>
                      )}
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

                    {form.attrezzo !== "VT" && item.role === "USCITA" && (
                      <p className="text-muted-foreground text-xs">
                        Un altro elemento impostato come uscita verrà spostato in fondo.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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

      <Card className="xl:max-h-[calc(100vh-14rem)]">
        <CardHeader>
          <CardTitle>Catalogo elementi</CardTitle>
          <CardDescription>
            Cerca nel CdP e aggiungi elementi alla composizione incrementale.
          </CardDescription>
        </CardHeader>
        <CardContent className="xl:max-h-[calc(100vh-22rem)] xl:overflow-y-auto xl:pr-2">
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

      <div className="flex flex-wrap items-center justify-end gap-3">
        {onRequestClose ? (
          <button
            type="button"
            className={buttonVariants({ variant: "outline" })}
            onClick={onRequestClose}
          >
            <span>Annulla</span>
            <KeyboardShortcutHint keys={["Esc"]} className="ml-1" />
          </button>
        ) : (
          <Link href={resolvedCloseHref} className={buttonVariants({ variant: "outline" })}>
            <span>Annulla</span>
            <KeyboardShortcutHint keys={["Esc"]} className="ml-1" />
          </Link>
        )}
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
