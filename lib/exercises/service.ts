import { prisma } from "@/lib/db";
import { calculateDScore } from "@/lib/exercises/d-score";
import {
  ExercisesStorageNotReadyError,
  isMissingExercisesTableError,
} from "@/lib/exercises/errors";
import { resolveExerciseElements, validateExerciseInput } from "@/lib/exercises/rules";
import type {
  ExerciseDetail,
  ExerciseInput,
  ExerciseSummary,
  ResolvedExerciseElement,
} from "@/lib/types/exercise";

const exerciseInclude = {
  elements: {
    orderBy: {
      order: "asc",
    },
  },
} as const;

function mapExercise(record: {
  id: string;
  name: string;
  attrezzo: ExerciseInput["attrezzo"];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  elements: {
    elementId: string;
    order: number;
    role: "STANDARD" | "USCITA" | "VOLTEGGIO";
    notes: string | null;
  }[];
}): ExerciseDetail {
  const resolvedElements: ResolvedExerciseElement[] = resolveExerciseElements({
    name: record.name,
    attrezzo: record.attrezzo,
    notes: record.notes,
    elements: record.elements.map((element) => ({
      elementId: element.elementId,
      order: element.order,
      role: element.role,
      notes: element.notes,
    })),
  });

  const dScore = calculateDScore(resolvedElements);

  return {
    id: record.id,
    name: record.name,
    attrezzo: record.attrezzo,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    elements: resolvedElements,
    elementCount: resolvedElements.length,
    dScore,
  };
}

function mapStorageError(error: unknown): never {
  if (isMissingExercisesTableError(error)) {
    throw new ExercisesStorageNotReadyError();
  }

  throw error;
}

export async function listExercisesForUser(
  userId: string,
  attrezzo?: ExerciseInput["attrezzo"],
): Promise<ExerciseSummary[]> {
  try {
    const records = await prisma.exercise.findMany({
      where: {
        createdById: userId,
        ...(attrezzo ? { attrezzo } : {}),
      },
      include: exerciseInclude,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return records.map((record) => mapExercise(record));
  } catch (error) {
    mapStorageError(error);
  }
}

export async function getExerciseForUser(
  exerciseId: string,
  userId: string,
): Promise<ExerciseDetail | null> {
  try {
    const record = await prisma.exercise.findFirst({
      where: {
        id: exerciseId,
        createdById: userId,
      },
      include: exerciseInclude,
    });

    if (!record) {
      return null;
    }

    return mapExercise(record);
  } catch (error) {
    mapStorageError(error);
  }
}

export async function createExerciseForUser(userId: string, input: ExerciseInput) {
  const issues = validateExerciseInput(input);
  if (issues.length > 0) {
    return { success: false as const, issues };
  }

  try {
    const exercise = await prisma.exercise.create({
      data: {
        name: input.name.trim(),
        attrezzo: input.attrezzo,
        createdById: userId,
        notes: input.notes?.trim() || null,
        elements: {
          create: input.elements.map((element) => ({
            elementId: element.elementId,
            order: element.order,
            role: element.role ?? (input.attrezzo === "VT" ? "VOLTEGGIO" : "STANDARD"),
            notes: element.notes?.trim() || null,
          })),
        },
      },
    });

    return { success: true as const, exerciseId: exercise.id };
  } catch (error) {
    mapStorageError(error);
  }
}

export async function updateExerciseForUser(
  exerciseId: string,
  userId: string,
  input: ExerciseInput,
) {
  try {
    const existing = await prisma.exercise.findFirst({
      where: {
        id: exerciseId,
        createdById: userId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return {
        success: false as const,
        issues: [{ field: "root", message: "Esercizio non trovato." }],
      };
    }

    const issues = validateExerciseInput(input);
    if (issues.length > 0) {
      return { success: false as const, issues };
    }

    await prisma.$transaction([
      prisma.exerciseElement.deleteMany({
        where: {
          exerciseId,
        },
      }),
      prisma.exercise.update({
        where: {
          id: exerciseId,
        },
        data: {
          name: input.name.trim(),
          attrezzo: input.attrezzo,
          notes: input.notes?.trim() || null,
          elements: {
            create: input.elements.map((element) => ({
              elementId: element.elementId,
              order: element.order,
              role: element.role ?? (input.attrezzo === "VT" ? "VOLTEGGIO" : "STANDARD"),
              notes: element.notes?.trim() || null,
            })),
          },
        },
      }),
    ]);

    return { success: true as const };
  } catch (error) {
    mapStorageError(error);
  }
}

export async function deleteExerciseForUser(exerciseId: string, userId: string) {
  try {
    const existing = await prisma.exercise.findFirst({
      where: {
        id: exerciseId,
        createdById: userId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return false;
    }

    await prisma.exercise.delete({
      where: {
        id: exerciseId,
      },
    });

    return true;
  } catch (error) {
    mapStorageError(error);
  }
}
