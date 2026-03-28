import type { Attrezzo } from "@/lib/types/cdp";
import type { ResolvedExerciseElement } from "@/lib/types/exercise";

const LETTER_SCORES: Record<string, number> = {
  A: 0.1,
  B: 0.2,
  C: 0.3,
  D: 0.4,
  E: 0.5,
  F: 0.6,
  G: 0.7,
  H: 0.8,
  I: 0.9,
  J: 1.0,
};

export function parseDifficultyValue(value: string): number {
  const trimmed = value.trim().toUpperCase();

  if (trimmed in LETTER_SCORES) {
    return LETTER_SCORES[trimmed];
  }

  const numeric = Number.parseFloat(trimmed.replace(",", "."));
  if (Number.isNaN(numeric)) {
    throw new Error(`[Exercises] Valore difficolta non supportato: ${value}`);
  }

  return numeric;
}

export function calculateDScore(attrezzo: Attrezzo, elements: ResolvedExerciseElement[]): number {
  const elementsTotal = elements.reduce((sum, item) => {
    return sum + parseDifficultyValue(item.element.valore);
  }, 0);

  if (attrezzo === "VT") {
    const avg = elements.length > 0 ? elementsTotal / elements.length : 0;
    return Number(avg.toFixed(3));
  }

  const groupsPresent = new Set<number>();
  for (const item of elements) {
    if (item.element.gruppo.numero >= 1 && item.element.gruppo.numero <= 4) {
      groupsPresent.add(item.element.gruppo.numero);
    }
  }

  const groupsBonus = groupsPresent.size * 0.5;
  return Number((elementsTotal + groupsBonus).toFixed(3));
}
