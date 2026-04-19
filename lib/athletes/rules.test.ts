import { describe, expect, it } from "vitest";

import { normalizeTesseraNumber, prepareAthleteInput } from "@/lib/athletes/rules";

const referenceNow = new Date(Date.UTC(2026, 3, 19));

describe("athlete rules", () => {
  it("normalizes names and tessera number", () => {
    const result = prepareAthleteInput(
      {
        firstName: "  Mario   Luigi ",
        lastName: " Rossi ",
        birthDate: "2010-05-12",
        tesseraNumber: " fig  123 ",
      },
      referenceNow,
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.firstName).toBe("Mario Luigi");
    expect(result.data.lastName).toBe("Rossi");
    expect(result.data.normalizedFirstName).toBe("mario luigi");
    expect(result.data.normalizedLastName).toBe("rossi");
    expect(result.data.tesseraNumber).toBe("fig 123");
    expect(result.data.normalizedTesseraNumber).toBe("FIG 123");
  });

  it("returns null for empty optional tessera number", () => {
    expect(normalizeTesseraNumber("   ")).toBeNull();
  });

  it("rejects invalid dates", () => {
    const result = prepareAthleteInput(
      {
        firstName: "Mario",
        lastName: "Rossi",
        birthDate: "2010-02-31",
        tesseraNumber: null,
      },
      referenceNow,
    );

    expect(result.success).toBe(false);
    expect(!result.success && result.issues[0]).toEqual({
      field: "birthDate",
      message: "Inserisci una data di nascita valida.",
    });
  });

  it("rejects today and future birth dates", () => {
    const today = prepareAthleteInput(
      {
        firstName: "Mario",
        lastName: "Rossi",
        birthDate: "2026-04-19",
        tesseraNumber: null,
      },
      referenceNow,
    );
    const future = prepareAthleteInput(
      {
        firstName: "Mario",
        lastName: "Rossi",
        birthDate: "2026-04-20",
        tesseraNumber: null,
      },
      referenceNow,
    );

    expect(today.success).toBe(false);
    expect(future.success).toBe(false);
    expect(!today.success && today.issues[0]?.field).toBe("birthDate");
    expect(!future.success && future.issues[0]?.field).toBe("birthDate");
  });
});
