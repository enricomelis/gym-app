import { describe, expect, it } from "vitest";

import { validateExerciseInput } from "@/lib/exercises/rules";
import type { ExerciseInput } from "@/lib/types/exercise";

describe("validateExerciseInput", () => {
  it("accepts a valid non-vault exercise", () => {
    const input: ExerciseInput = {
      name: "Corpo libero",
      attrezzo: "CL",
      notes: null,
      elements: [
        { elementId: "CL-I-1", order: 1, role: "STANDARD" },
        { elementId: "CL-I-2", order: 2, role: "STANDARD" },
      ],
    };

    expect(validateExerciseInput(input)).toHaveLength(0);
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
      elements: [{ elementId: "VT-I-1", order: 1, role: "STANDARD" }],
    };

    expect(validateExerciseInput(input).map((issue) => issue.message)).toContain(
      "Tutti gli elementi devono appartenere allo stesso attrezzo dell'esercizio.",
    );
  });

  it("rejects an exit if it is not the eighth element", () => {
    const input: ExerciseInput = {
      name: "Corpo libero errato",
      attrezzo: "CL",
      notes: null,
      elements: [
        { elementId: "CL-I-1", order: 1, role: "STANDARD" },
        { elementId: "CL-I-2", order: 2, role: "USCITA" },
      ],
    };

    expect(validateExerciseInput(input).map((issue) => issue.message)).toContain(
      "L'uscita puo essere segnata solo come ottavo elemento.",
    );
  });

  it("requires the eighth element to be the exit when the exercise has eight elements", () => {
    const input: ExerciseInput = {
      name: "Corpo libero completo",
      attrezzo: "CL",
      notes: null,
      elements: [
        { elementId: "CL-I-1", order: 1, role: "STANDARD" },
        { elementId: "CL-I-2", order: 2, role: "STANDARD" },
        { elementId: "CL-I-3", order: 3, role: "STANDARD" },
        { elementId: "CL-I-7", order: 4, role: "STANDARD" },
        { elementId: "CL-I-8", order: 5, role: "STANDARD" },
        { elementId: "CL-I-9", order: 6, role: "STANDARD" },
        { elementId: "CL-I-10", order: 7, role: "STANDARD" },
        { elementId: "CL-I-13", order: 8, role: "STANDARD" },
      ],
    };

    expect(validateExerciseInput(input).map((issue) => issue.message)).toContain(
      "Con otto elementi l'ottavo deve essere sempre l'uscita.",
    );
  });
});
