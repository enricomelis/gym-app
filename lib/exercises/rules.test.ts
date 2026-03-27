import { describe, expect, it } from "vitest";

import { validateExerciseInput } from "@/lib/exercises/rules";
import type { ExerciseInput } from "@/lib/types/exercise";

describe("validateExerciseInput", () => {
  it("accepts a valid non-vault exercise with the exit as the last element", () => {
    const input: ExerciseInput = {
      name: "Corpo libero",
      attrezzo: "CL",
      notes: null,
      elements: [
        { elementId: "CL-I-1", order: 1, role: "STANDARD" },
        { elementId: "CL-II-1", order: 2, role: "USCITA" },
      ],
    };

    expect(validateExerciseInput(input)).toHaveLength(0);
  });

  it("rejects a non-vault exercise without an exit", () => {
    const input: ExerciseInput = {
      name: "Corpo libero incompleto",
      attrezzo: "CL",
      notes: null,
      elements: [
        { elementId: "CL-I-1", order: 1, role: "STANDARD" },
        { elementId: "CL-II-1", order: 2, role: "STANDARD" },
      ],
    };

    expect(validateExerciseInput(input).map((issue) => issue.message)).toContain(
      "Gli esercizi diversi dal volteggio devono avere sempre un'uscita.",
    );
  });

  it("rejects an exit if it is not the last element", () => {
    const input: ExerciseInput = {
      name: "Corpo libero errato",
      attrezzo: "CL",
      notes: null,
      elements: [
        { elementId: "CL-I-1", order: 1, role: "USCITA" },
        { elementId: "CL-II-1", order: 2, role: "STANDARD" },
      ],
    };

    expect(validateExerciseInput(input).map((issue) => issue.message)).toContain(
      "L'uscita deve essere sempre l'ultimo elemento della composizione.",
    );
  });

  it("rejects multiple exits", () => {
    const input: ExerciseInput = {
      name: "Corpo libero con doppia uscita",
      attrezzo: "CL",
      notes: null,
      elements: [
        { elementId: "CL-I-1", order: 1, role: "USCITA" },
        { elementId: "CL-II-1", order: 2, role: "USCITA" },
      ],
    };

    expect(validateExerciseInput(input).map((issue) => issue.message)).toContain(
      "Gli esercizi diversi dal volteggio devono avere sempre un'uscita.",
    );
  });

  it("rejects more than two vault elements", () => {
    const input: ExerciseInput = {
      name: "Volteggio",
      attrezzo: "VT",
      notes: null,
      elements: [
        { elementId: "VT-I-1", order: 1, role: "VOLTEGGIO" },
        { elementId: "VT-I-2", order: 2, role: "VOLTEGGIO" },
        { elementId: "VT-I-3", order: 3, role: "VOLTEGGIO" },
      ],
    };

    expect(validateExerciseInput(input).map((issue) => issue.message)).toContain(
      "Il volteggio accetta uno o due salti.",
    );
  });

  it("rejects an exit on vault", () => {
    const input: ExerciseInput = {
      name: "Volteggio",
      attrezzo: "VT",
      notes: null,
      elements: [{ elementId: "VT-I-1", order: 1, role: "USCITA" }],
    };

    expect(validateExerciseInput(input).map((issue) => issue.message)).toContain(
      "Il volteggio non supporta l'uscita.",
    );
  });

  it("rejects elements from a different apparatus", () => {
    const input: ExerciseInput = {
      name: "Misto errato",
      attrezzo: "CL",
      notes: null,
      elements: [{ elementId: "VT-I-1", order: 1, role: "USCITA" }],
    };

    expect(validateExerciseInput(input).map((issue) => issue.message)).toContain(
      "Tutti gli elementi devono appartenere allo stesso attrezzo dell'esercizio.",
    );
  });
});
