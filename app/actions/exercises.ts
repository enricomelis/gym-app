"use server";

import { revalidatePath } from "next/cache";

import { exerciseSchema } from "@/app/actions/exercise-schemas";
import { ExercisesStorageNotReadyError } from "@/lib/exercises/errors";
import {
  createExerciseForUser,
  deleteExerciseForUser,
  getExerciseForUser,
  listExercisesForUser,
  updateExerciseForUser,
} from "@/lib/exercises/service";
import { requireTecnicoSession } from "@/lib/session";
import type { ExerciseInput } from "@/lib/types/exercise";

type ActionState =
  | { success: true; exerciseId?: string }
  | { success: false; error?: string; fieldErrors?: Record<string, string[]> };

function toFieldErrors(issues: { field: string; message: string }[]) {
  return issues.reduce<Record<string, string[]>>((acc, issue) => {
    acc[issue.field] ??= [];
    acc[issue.field].push(issue.message);
    return acc;
  }, {});
}

export async function createExercise(input: ExerciseInput): Promise<ActionState> {
  const session = await requireTecnicoSession();
  console.log("[Exercises] create:start", { userId: session.user.id, attrezzo: input.attrezzo });

  const parsed = exerciseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const result = await createExerciseForUser(session.user.id, parsed.data);
    if (!result.success) {
      return { success: false, fieldErrors: toFieldErrors(result.issues) };
    }

    console.log("[Exercises] create:success", {
      userId: session.user.id,
      exerciseId: result.exerciseId,
    });
    revalidatePath("/esercizi");
    return { success: true, exerciseId: result.exerciseId };
  } catch (error) {
    console.error("[Exercises] create:error", { userId: session.user.id, error });
    if (error instanceof ExercisesStorageNotReadyError) {
      return {
        success: false,
        error:
          "Il database non e ancora pronto per gli esercizi. Applica prima la migration Prisma.",
      };
    }
    return { success: false, error: "Impossibile creare l'esercizio. Riprova." };
  }
}

export async function listExercises(attrezzo?: ExerciseInput["attrezzo"]) {
  const session = await requireTecnicoSession();
  return listExercisesForUser(session.user.id, attrezzo);
}

export async function getExercise(exerciseId: string) {
  const session = await requireTecnicoSession();
  return getExerciseForUser(exerciseId, session.user.id);
}

export async function updateExercise(
  exerciseId: string,
  input: ExerciseInput,
): Promise<ActionState> {
  const session = await requireTecnicoSession();
  console.log("[Exercises] update:start", { userId: session.user.id, exerciseId });

  const parsed = exerciseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const result = await updateExerciseForUser(exerciseId, session.user.id, parsed.data);
    if (!result.success) {
      return { success: false, fieldErrors: toFieldErrors(result.issues) };
    }

    console.log("[Exercises] update:success", { userId: session.user.id, exerciseId });
    revalidatePath("/esercizi");
    revalidatePath(`/esercizi/${exerciseId}`);
    return { success: true, exerciseId };
  } catch (error) {
    console.error("[Exercises] update:error", { userId: session.user.id, exerciseId, error });
    if (error instanceof ExercisesStorageNotReadyError) {
      return {
        success: false,
        error:
          "Il database non e ancora pronto per gli esercizi. Applica prima la migration Prisma.",
      };
    }
    return { success: false, error: "Impossibile aggiornare l'esercizio. Riprova." };
  }
}

export async function deleteExercise(exerciseId: string): Promise<ActionState> {
  const session = await requireTecnicoSession();
  console.log("[Exercises] delete:start", { userId: session.user.id, exerciseId });

  try {
    const deleted = await deleteExerciseForUser(exerciseId, session.user.id);
    if (!deleted) {
      return { success: false, error: "Esercizio non trovato." };
    }

    console.log("[Exercises] delete:success", { userId: session.user.id, exerciseId });
    revalidatePath("/esercizi");
    return { success: true };
  } catch (error) {
    console.error("[Exercises] delete:error", { userId: session.user.id, exerciseId, error });
    if (error instanceof ExercisesStorageNotReadyError) {
      return {
        success: false,
        error:
          "Il database non e ancora pronto per gli esercizi. Applica prima la migration Prisma.",
      };
    }
    return { success: false, error: "Impossibile eliminare l'esercizio. Riprova." };
  }
}
