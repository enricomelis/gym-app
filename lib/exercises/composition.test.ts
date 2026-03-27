import { describe, expect, it } from "vitest";

import {
  insertElement,
  markElementAsExit,
  moveElement,
  normalizeComposition,
  removeElement,
} from "@/lib/exercises/composition";
import type { ExerciseElementInput } from "@/lib/types/exercise";

const BASE_ELEMENTS: ExerciseElementInput[] = [
  { elementId: "CL-I-1", order: 1, role: "STANDARD" },
  { elementId: "CL-II-1", order: 2, role: "STANDARD" },
  { elementId: "CL-III-1", order: 3, role: "STANDARD" },
];

describe("composition helpers", () => {
  it("moves the selected exit to the end", () => {
    const composition = normalizeComposition("CL", BASE_ELEMENTS, null);

    const next = markElementAsExit(
      "CL",
      {
        elements: composition.elements,
        manualExitElementId: null,
      },
      0,
    );

    expect(next.elements.map((element) => element.elementId)).toEqual([
      "CL-II-1",
      "CL-III-1",
      "CL-I-1",
    ]);
    expect(next.elements.at(-1)?.role).toBe("USCITA");
  });

  it("inserts new elements before an explicit exit", () => {
    const withExit = markElementAsExit(
      "CL",
      {
        elements: normalizeComposition("CL", BASE_ELEMENTS, null).elements,
        manualExitElementId: null,
      },
      1,
    );

    const next = insertElement("CL", withExit, {
      elementId: "CL-IV-2",
      order: 99,
      role: "STANDARD",
    });

    expect(next.elements.map((element) => element.elementId)).toEqual([
      "CL-I-1",
      "CL-III-1",
      "CL-IV-2",
      "CL-II-1",
    ]);
    expect(next.elements.at(-1)?.role).toBe("USCITA");
  });

  it("keeps the exit at the end when removing a different element", () => {
    const withExit = markElementAsExit(
      "CL",
      {
        elements: normalizeComposition("CL", BASE_ELEMENTS, null).elements,
        manualExitElementId: null,
      },
      1,
    );

    const next = removeElement("CL", withExit, 0);

    expect(next.elements.map((element) => element.elementId)).toEqual(["CL-III-1", "CL-II-1"]);
    expect(next.elements.at(-1)?.role).toBe("USCITA");
  });

  it("preserves the explicit exit when moving the sequence", () => {
    const withExit = markElementAsExit(
      "CL",
      {
        elements: normalizeComposition("CL", BASE_ELEMENTS, null).elements,
        manualExitElementId: null,
      },
      0,
    );

    const next = moveElement("CL", withExit, 0, 1);

    expect(next.elements.map((element) => element.elementId)).toEqual([
      "CL-III-1",
      "CL-II-1",
      "CL-I-1",
    ]);
    expect(next.elements.at(-1)?.role).toBe("USCITA");
  });
});
