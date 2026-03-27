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

export function calculateDScore(elements: ResolvedExerciseElement[]): number {
  const total = elements.reduce((sum, item) => {
    return sum + parseDifficultyValue(item.element.valore);
  }, 0);

  return Number(total.toFixed(3));
}
