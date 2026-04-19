import { prisma } from "@/lib/db";
import { AthletesStorageNotReadyError, isMissingAthletesTableError } from "@/lib/athletes/errors";
import { prepareAthleteInput, type PreparedAthleteInput } from "@/lib/athletes/rules";
import type { AthleteDetail, AthleteInput, AthleteSummary } from "@/lib/types/athlete";

type AthleteRecord = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  tesseraNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapAthlete(record: AthleteRecord): AthleteDetail {
  return {
    id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    birthDate: record.birthDate,
    tesseraNumber: record.tesseraNumber,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function mapStorageError(error: unknown): never {
  if (isMissingAthletesTableError(error)) {
    throw new AthletesStorageNotReadyError();
  }

  throw error;
}

function mapUniqueError(error: unknown) {
  if (!(error instanceof Error) || !error.message.includes("P2002")) {
    return null;
  }

  if (error.message.includes("normalizedTesseraNumber")) {
    return {
      field: "tesseraNumber",
      message: "Questo numero tessera e gia associato a un atleta.",
    };
  }

  return {
    field: "root",
    message: "Esiste gia un atleta con stesso nome, cognome e data di nascita.",
  };
}

async function validateUniqueAthleteForCoach(
  coachId: string,
  data: PreparedAthleteInput,
  excludedAthleteId?: string,
) {
  if (data.normalizedTesseraNumber) {
    const existingTessera = await prisma.athlete.findFirst({
      where: {
        normalizedTesseraNumber: data.normalizedTesseraNumber,
        ...(excludedAthleteId ? { id: { not: excludedAthleteId } } : {}),
      },
      select: { id: true },
    });

    if (existingTessera) {
      return {
        success: false as const,
        issues: [
          {
            field: "tesseraNumber",
            message: "Questo numero tessera e gia associato a un atleta.",
          },
        ],
      };
    }
  }

  const existingIdentity = await prisma.athlete.findFirst({
    where: {
      coachId,
      normalizedFirstName: data.normalizedFirstName,
      normalizedLastName: data.normalizedLastName,
      birthDate: data.birthDate,
      ...(excludedAthleteId ? { id: { not: excludedAthleteId } } : {}),
    },
    select: { id: true },
  });

  if (existingIdentity) {
    return {
      success: false as const,
      issues: [
        {
          field: "root",
          message: "Esiste gia un atleta con stesso nome, cognome e data di nascita.",
        },
      ],
    };
  }

  return { success: true as const };
}

export async function listAthletesForCoach(coachId: string): Promise<AthleteSummary[]> {
  try {
    const records = await prisma.athlete.findMany({
      where: { coachId },
      orderBy: [{ normalizedLastName: "asc" }, { normalizedFirstName: "asc" }],
    });

    return records.map((record) => mapAthlete(record));
  } catch (error) {
    mapStorageError(error);
  }
}

export async function getAthleteForCoach(
  athleteId: string,
  coachId: string,
): Promise<AthleteDetail | null> {
  try {
    const record = await prisma.athlete.findFirst({
      where: {
        id: athleteId,
        coachId,
      },
    });

    if (!record) {
      return null;
    }

    return mapAthlete(record);
  } catch (error) {
    mapStorageError(error);
  }
}

export async function createAthleteForCoach(coachId: string, input: AthleteInput) {
  const prepared = prepareAthleteInput(input);
  if (!prepared.success) {
    return { success: false as const, issues: prepared.issues };
  }

  try {
    const unique = await validateUniqueAthleteForCoach(coachId, prepared.data);
    if (!unique.success) {
      return unique;
    }

    const athlete = await prisma.athlete.create({
      data: {
        coachId,
        ...prepared.data,
      },
      select: { id: true },
    });

    return { success: true as const, athleteId: athlete.id };
  } catch (error) {
    if (isMissingAthletesTableError(error)) {
      throw new AthletesStorageNotReadyError();
    }

    const uniqueIssue = mapUniqueError(error);
    if (uniqueIssue) {
      return { success: false as const, issues: [uniqueIssue] };
    }

    throw error;
  }
}

export async function updateAthleteForCoach(
  athleteId: string,
  coachId: string,
  input: AthleteInput,
) {
  const prepared = prepareAthleteInput(input);
  if (!prepared.success) {
    return { success: false as const, issues: prepared.issues };
  }

  try {
    const existing = await prisma.athlete.findFirst({
      where: {
        id: athleteId,
        coachId,
      },
      select: { id: true },
    });

    if (!existing) {
      return {
        success: false as const,
        issues: [{ field: "root", message: "Atleta non trovato." }],
      };
    }

    const unique = await validateUniqueAthleteForCoach(coachId, prepared.data, athleteId);
    if (!unique.success) {
      return unique;
    }

    await prisma.athlete.update({
      where: { id: athleteId },
      data: prepared.data,
    });

    return { success: true as const };
  } catch (error) {
    if (isMissingAthletesTableError(error)) {
      throw new AthletesStorageNotReadyError();
    }

    const uniqueIssue = mapUniqueError(error);
    if (uniqueIssue) {
      return { success: false as const, issues: [uniqueIssue] };
    }

    throw error;
  }
}

export async function deleteAthleteForCoach(athleteId: string, coachId: string) {
  try {
    const existing = await prisma.athlete.findFirst({
      where: {
        id: athleteId,
        coachId,
      },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.athlete.delete({
      where: { id: athleteId },
    });

    return true;
  } catch (error) {
    mapStorageError(error);
  }
}
