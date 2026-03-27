import { getCatalogElementById } from "@/lib/cdp/catalog";
import type {
  ExerciseElementInput,
  ExerciseInput,
  ExerciseValidationIssue,
  ResolvedExerciseElement,
} from "@/lib/types/exercise";

function normalizeRole(input: ExerciseElementInput): ResolvedExerciseElement["role"] {
  if (input.role) {
    return input.role;
  }

  return "STANDARD";
}

export function validateExerciseInput(input: ExerciseInput): ExerciseValidationIssue[] {
  const issues: ExerciseValidationIssue[] = [];

  if (!input.name.trim()) {
    issues.push({ field: "name", message: "Il nome dell'esercizio è obbligatorio." });
  }

  if (input.elements.length === 0) {
    issues.push({ field: "elements", message: "Aggiungi almeno un elemento all'esercizio." });
    return issues;
  }

  const seenOrders = new Set<number>();
  let uscitaCount = 0;
  let uscitaOrder: number | null = null;

  for (const [index, item] of input.elements.entries()) {
    if (seenOrders.has(item.order)) {
      issues.push({
        field: `elements.${index}.order`,
        message: "L'ordine degli elementi deve essere univoco.",
      });
    }
    seenOrders.add(item.order);

    const element = getCatalogElementById(item.elementId);
    if (!element) {
      issues.push({
        field: `elements.${index}.elementId`,
        message: "L'elemento selezionato non esiste nel catalogo.",
      });
      continue;
    }

    if (element.attrezzo !== input.attrezzo) {
      issues.push({
        field: `elements.${index}.elementId`,
        message: "Tutti gli elementi devono appartenere allo stesso attrezzo dell'esercizio.",
      });
    }

    const role = normalizeRole(item);
    if (role === "USCITA") {
      uscitaCount += 1;
      uscitaOrder = item.order;
    }

    if (input.attrezzo === "VT" && role === "USCITA") {
      issues.push({
        field: `elements.${index}.role`,
        message: "Il volteggio non supporta l'uscita.",
      });
    }
  }

  if (input.attrezzo === "VT") {
    if (input.elements.length < 1 || input.elements.length > 2) {
      issues.push({
        field: "elements",
        message: "Il volteggio accetta uno o due salti.",
      });
    }
  } else {
    if (input.elements.length > 8) {
      issues.push({
        field: "elements",
        message: "Gli esercizi possono contenere al massimo otto elementi.",
      });
    }

    if (uscitaCount > 1) {
      issues.push({
        field: "elements",
        message: "Puoi indicare una sola uscita per esercizio.",
      });
    }

    if (input.elements.length === 8 && (uscitaCount !== 1 || uscitaOrder !== 8)) {
      issues.push({
        field: "elements",
        message: "Con otto elementi l'ottavo deve essere sempre l'uscita.",
      });
    }

    if (uscitaCount === 1 && (input.elements.length !== 8 || uscitaOrder !== 8)) {
      issues.push({
        field: "elements",
        message: "L'uscita puo essere segnata solo come ottavo elemento.",
      });
    }
  }

  return issues;
}

export function resolveExerciseElements(input: ExerciseInput): ResolvedExerciseElement[] {
  return [...input.elements]
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      const element = getCatalogElementById(item.elementId);
      if (!element) {
        throw new Error(`[Exercises] Elemento non trovato nel catalogo: ${item.elementId}`);
      }

      return {
        ...item,
        role: normalizeRole(item),
        notes: item.notes ?? null,
        element,
      };
    });
}
