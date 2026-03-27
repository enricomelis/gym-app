import type { Attrezzo } from "@/lib/types/cdp";
import type { ExerciseElementInput } from "@/lib/types/exercise";

export interface CompositionState {
  elements: ExerciseElementInput[];
  manualExitElementId: string | null;
}

function normalizeVaultElements(elements: ExerciseElementInput[]): CompositionState {
  return {
    elements: elements.map((element, index) => ({
      ...element,
      order: index + 1,
      role: "VOLTEGGIO",
    })),
    manualExitElementId: null,
  };
}

export function normalizeComposition(
  attrezzo: Attrezzo,
  elements: ExerciseElementInput[],
  manualExitElementId: string | null,
): CompositionState {
  if (attrezzo === "VT") {
    return normalizeVaultElements(elements);
  }

  const items = [...elements];
  const explicitExitIndex =
    manualExitElementId !== null
      ? items.findIndex((element) => element.elementId === manualExitElementId)
      : -1;

  if (explicitExitIndex >= 0) {
    const [selectedExit] = items.splice(explicitExitIndex, 1);
    if (selectedExit) {
      items.push(selectedExit);
    }
  }

  const resolvedManualExitId =
    manualExitElementId !== null &&
    items.some((element) => element.elementId === manualExitElementId)
      ? manualExitElementId
      : null;

  return {
    manualExitElementId: resolvedManualExitId,
    elements: items.map((element, index) => ({
      ...element,
      order: index + 1,
      role: index === items.length - 1 ? "USCITA" : "STANDARD",
    })),
  };
}

export function insertElement(
  attrezzo: Attrezzo,
  current: CompositionState,
  nextElement: ExerciseElementInput,
): CompositionState {
  if (attrezzo === "VT") {
    return normalizeComposition(attrezzo, [...current.elements, nextElement], null);
  }

  if (current.manualExitElementId) {
    const exitIndex = current.elements.findIndex(
      (element) => element.elementId === current.manualExitElementId,
    );

    if (exitIndex >= 0) {
      const nextItems = [...current.elements];
      nextItems.splice(exitIndex, 0, nextElement);
      return normalizeComposition(attrezzo, nextItems, current.manualExitElementId);
    }
  }

  return normalizeComposition(attrezzo, [...current.elements, nextElement], null);
}

export function removeElement(
  attrezzo: Attrezzo,
  current: CompositionState,
  index: number,
): CompositionState {
  const removed = current.elements[index];
  const nextManualExitId =
    removed?.elementId === current.manualExitElementId ? null : current.manualExitElementId;

  return normalizeComposition(
    attrezzo,
    current.elements.filter((_, currentIndex) => currentIndex !== index),
    nextManualExitId,
  );
}

export function moveElement(
  attrezzo: Attrezzo,
  current: CompositionState,
  index: number,
  direction: -1 | 1,
): CompositionState {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= current.elements.length) {
    return current;
  }

  const nextItems = [...current.elements];
  [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];

  return normalizeComposition(attrezzo, nextItems, current.manualExitElementId);
}

export function markElementAsExit(
  attrezzo: Attrezzo,
  current: CompositionState,
  index: number,
): CompositionState {
  const target = current.elements[index];
  if (!target || attrezzo === "VT") {
    return current;
  }

  return normalizeComposition(attrezzo, current.elements, target.elementId);
}
