import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { parseDifficultyValue } from "@/lib/exercises/d-score";
import { validateExerciseInput } from "@/lib/exercises/rules";
import type { ExerciseInput } from "@/lib/types/exercise";

describe("exercise properties", () => {
  it("never produces NaN for supported difficulty values", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constantFrom("A", "B", "C", "D", "E", "F", "G", "H", "I", "J"),
          fc
            .integer({ min: 1, max: 100 })
            .map((value) => (value / 10).toFixed(1).replace(".", ",")),
        ),
        (value) => {
          expect(Number.isNaN(parseDifficultyValue(value))).toBe(false);
        },
      ),
    );
  });

  it("rejects all vault compositions larger than two elements", () => {
    fc.assert(
      fc.property(fc.integer({ min: 3, max: 8 }), (count) => {
        const input: ExerciseInput = {
          name: "Volteggio random",
          attrezzo: "VT",
          notes: null,
          elements: Array.from({ length: count }, (_, index) => ({
            elementId: `VT-I-${(index % 5) + 1}`,
            order: index + 1,
            role: "VOLTEGGIO",
          })),
        };

        expect(
          validateExerciseInput(input).some((issue) => issue.message.includes("volteggio")),
        ).toBe(true);
      }),
    );
  });
});
