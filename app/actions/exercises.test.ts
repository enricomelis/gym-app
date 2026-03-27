import { beforeEach, describe, expect, it, vi } from "vitest";

import { createExercise, deleteExercise, updateExercise } from "@/app/actions/exercises";
import type { ExerciseInput } from "@/lib/types/exercise";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  requireTecnicoSession: vi.fn(async () => ({
    user: {
      id: "user-1",
      role: "TECNICO",
    },
  })),
}));

vi.mock("@/lib/exercises/service", () => ({
  createExerciseForUser: vi.fn(async () => ({ success: true, exerciseId: "exercise-1" })),
  updateExerciseForUser: vi.fn(async () => ({ success: true })),
  deleteExerciseForUser: vi.fn(async () => true),
  listExercisesForUser: vi.fn(async () => []),
  getExerciseForUser: vi.fn(async () => null),
}));

const validInput: ExerciseInput = {
  name: "Corpo libero",
  attrezzo: "CL",
  notes: null,
  elements: [{ elementId: "CL-I-1", order: 1, role: "STANDARD" }],
};

describe("exercise actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a valid exercise", async () => {
    const result = await createExercise(validInput);

    expect(result).toEqual({ success: true, exerciseId: "exercise-1" });
  });

  it("returns field errors on invalid create input", async () => {
    const result = await createExercise({
      ...validInput,
      name: "",
    });

    expect(result.success).toBe(false);
    expect("fieldErrors" in result && result.fieldErrors?.name).toBeDefined();
  });

  it("updates a valid exercise", async () => {
    const result = await updateExercise("exercise-1", validInput);

    expect(result).toEqual({ success: true, exerciseId: "exercise-1" });
  });

  it("deletes an existing exercise", async () => {
    const result = await deleteExercise("exercise-1");

    expect(result).toEqual({ success: true });
  });
});
