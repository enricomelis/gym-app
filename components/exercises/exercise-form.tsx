"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { createExercise, updateExercise } from "@/app/actions/exercises";
import { CdpElementoDialog } from "@/components/cdp/cdp-elemento-dialog";
import { ATTREZZI } from "@/components/cdp/cdp-constants";
import { ExerciseCatalog } from "@/components/exercises/exercise-catalog";
import { ExerciseCompositionList } from "@/components/exercises/exercise-composition-list";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
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
import type { ExerciseDetail, ExerciseElementInput, ExerciseInput } from "@/lib/types/exercise";

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
  elements: ExerciseElementInput[];
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
  const resolvedCloseHref =
    closeHref ?? (initialData ? `/esercizi/${initialData.id}` : "/esercizi");

  const [form, setForm] = useState<{
    name: string;
    attrezzo: Attrezzo;
    notes: string;
    elements: ExerciseElementInput[];
  }>({
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

  const maxSlots = form.attrezzo === "VT" ? 2 : 8;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col xl:h-[calc(100svh-11rem)]">
      <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Left column — scrollable catalog */}
        <div className="min-w-0 xl:overflow-y-auto xl:pr-2">
          <h3 className="text-sm font-semibold tracking-tight xl:sticky xl:top-0 xl:z-10 xl:bg-background xl:pb-2">
            Catalogo elementi
          </h3>
          <ExerciseCatalog
            elements={availableCatalogElements}
            onAddElement={addElement}
            addDisabled={
              form.attrezzo === "VT"
                ? composition.elements.length >= 2
                : composition.elements.length >= 8
            }
          />
        </div>

        {/* Right column — sticky composition + D-score + metadata */}
        <div className="flex flex-col gap-5 xl:overflow-y-auto xl:pr-2">
          {/* Composizione */}
          <section className="grid gap-2">
            <h3 className="text-sm font-semibold tracking-tight">Composizione</h3>

            {serverError && (
              <div className="bg-destructive/10 border-l-destructive flex items-start gap-3 rounded-lg border border-destructive/20 border-l-4 p-3">
                <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
                <p className="text-destructive text-sm font-medium">{serverError}</p>
              </div>
            )}

            <ExerciseCompositionList
              attrezzo={form.attrezzo}
              resolvedElements={resolvedElements}
              maxSlots={maxSlots}
              onSelectElement={setSelectedElementId}
              onMoveElement={moveElementAt}
              onRemoveElement={removeElementAt}
              onMarkExit={markExitAt}
            />

            {fieldErrors.elements && (
              <p className="text-destructive text-sm">{fieldErrors.elements[0]}</p>
            )}
          </section>

          {/* Nota D */}
          <section className="flex items-baseline gap-3 rounded-lg border bg-muted/30 px-4 py-3">
            <span className="text-muted-foreground text-sm font-medium">Nota D</span>
            <span className="text-2xl font-bold tracking-tight">{dScore.toFixed(3)}</span>
          </section>

          {/* Metadati */}
          <section className="grid gap-3">
            <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Metadati
            </h3>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="exercise-name" className="text-xs">
                  Nome esercizio
                </Label>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="exercise-attrezzo" className="text-xs">
                    Attrezzo
                  </Label>
                  <select
                    id="exercise-attrezzo"
                    className="border-input bg-background h-9 rounded-lg border px-3 text-sm"
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

                <div className="grid gap-1.5">
                  <Label htmlFor="exercise-notes" className="text-xs">
                    Note
                  </Label>
                  <Textarea
                    id="exercise-notes"
                    value={form.notes ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, notes: event.target.value }))
                    }
                    aria-invalid={fieldErrors.notes ? true : undefined}
                    className="min-h-9"
                    rows={1}
                  />
                  {fieldErrors.notes && (
                    <p className="text-destructive text-sm">{fieldErrors.notes[0]}</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Actions — always visible, outside scrollable area */}
      <div className="bg-background flex shrink-0 justify-end items-center gap-3 border-t pt-3">
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
