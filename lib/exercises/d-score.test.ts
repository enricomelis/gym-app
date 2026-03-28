import { describe, expect, it } from "vitest";

import { calculateDScore, parseDifficultyValue } from "@/lib/exercises/d-score";
import { resolveExerciseElements } from "@/lib/exercises/rules";
import type { ExerciseInput } from "@/lib/types/exercise";

describe("parseDifficultyValue", () => {
  it("parses letter values", () => {
    expect(parseDifficultyValue("A")).toBe(0.1);
    expect(parseDifficultyValue("C")).toBe(0.3);
    expect(parseDifficultyValue("J")).toBe(1);
  });

  it("parses numeric values with comma", () => {
    expect(parseDifficultyValue("2,4")).toBe(2.4);
  });
});

describe("calculateDScore", () => {
  it("adds the structural group bonus for non-vault exercises", () => {
    const input: ExerciseInput = {
      name: "Corpo libero demo",
      attrezzo: "CL",
      notes: null,
      elements: [
        { elementId: "CL-I-1", order: 1, role: "STANDARD" },
        { elementId: "CL-II-1", order: 2, role: "STANDARD" },
        { elementId: "CL-IV-2", order: 3, role: "USCITA" },
      ],
    };

    const resolved = resolveExerciseElements(input);

    expect(calculateDScore("CL", resolved)).toBe(1.9);
  });

  it("does not award the missing structural group", () => {
    const input: ExerciseInput = {
      name: "Corpo libero parziale",
      attrezzo: "CL",
      notes: null,
      elements: [
        { elementId: "CL-I-1", order: 1, role: "STANDARD" },
        { elementId: "CL-I-2", order: 2, role: "STANDARD" },
        { elementId: "CL-IV-2", order: 3, role: "USCITA" },
      ],
    };

    const resolved = resolveExerciseElements(input);

    expect(calculateDScore("CL", resolved)).toBe(1.5);
  });

  it("does not add structural-group bonus on vault", () => {
    const input: ExerciseInput = {
      name: "Volteggio",
      attrezzo: "VT",
      notes: null,
      elements: [{ elementId: "VT-I-1", order: 1, role: "VOLTEGGIO" }],
    };

    const resolved = resolveExerciseElements(input);

    expect(calculateDScore("VT", resolved)).toBe(2.4);
  });
});
