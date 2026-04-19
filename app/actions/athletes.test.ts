import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAthlete, deleteAthlete, updateAthlete } from "@/app/actions/athletes";
import {
  createAthleteForCoach,
  deleteAthleteForCoach,
  updateAthleteForCoach,
} from "@/lib/athletes/service";
import type { AthleteInput } from "@/lib/types/athlete";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  requireTecnicoSession: vi.fn(async () => ({
    user: {
      id: "coach-1",
      role: "TECNICO",
    },
  })),
}));

vi.mock("@/lib/athletes/service", () => ({
  createAthleteForCoach: vi.fn(async () => ({ success: true, athleteId: "athlete-1" })),
  updateAthleteForCoach: vi.fn(async () => ({ success: true })),
  deleteAthleteForCoach: vi.fn(async () => true),
  listAthletesForCoach: vi.fn(async () => []),
  getAthleteForCoach: vi.fn(async () => null),
}));

const validInput: AthleteInput = {
  firstName: "Mario",
  lastName: "Rossi",
  birthDate: "2010-05-12",
  tesseraNumber: "FIG123",
};

describe("athlete actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a valid athlete", async () => {
    const result = await createAthlete(validInput);

    expect(result).toEqual({ success: true, athleteId: "athlete-1" });
    expect(createAthleteForCoach).toHaveBeenCalledWith("coach-1", validInput);
  });

  it("returns field errors on invalid create input", async () => {
    const result = await createAthlete({
      ...validInput,
      firstName: "",
    });

    expect(result.success).toBe(false);
    expect("fieldErrors" in result && result.fieldErrors?.firstName).toBeDefined();
  });

  it("returns tessera number field errors from the service", async () => {
    vi.mocked(createAthleteForCoach).mockResolvedValueOnce({
      success: false,
      issues: [
        {
          field: "tesseraNumber",
          message: "Questo numero tessera e gia associato a un atleta.",
        },
      ],
    });

    const result = await createAthlete(validInput);

    expect(result.success).toBe(false);
    expect("fieldErrors" in result && result.fieldErrors?.tesseraNumber?.[0]).toBe(
      "Questo numero tessera e gia associato a un atleta.",
    );
  });

  it("updates a valid athlete", async () => {
    const result = await updateAthlete("athlete-1", validInput);

    expect(result).toEqual({ success: true, athleteId: "athlete-1" });
    expect(updateAthleteForCoach).toHaveBeenCalledWith("athlete-1", "coach-1", validInput);
  });

  it("deletes an existing athlete", async () => {
    const result = await deleteAthlete("athlete-1");

    expect(result).toEqual({ success: true });
    expect(deleteAthleteForCoach).toHaveBeenCalledWith("athlete-1", "coach-1");
  });
});
