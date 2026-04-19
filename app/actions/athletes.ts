"use server";

import { revalidatePath } from "next/cache";

import { athleteSchema } from "@/app/actions/athlete-schemas";
import { AthletesStorageNotReadyError } from "@/lib/athletes/errors";
import {
  createAthleteForCoach,
  deleteAthleteForCoach,
  getAthleteForCoach,
  listAthletesForCoach,
  updateAthleteForCoach,
} from "@/lib/athletes/service";
import { requireTecnicoSession } from "@/lib/session";
import type { AthleteInput } from "@/lib/types/athlete";

type ActionState =
  | { success: true; athleteId?: string }
  | { success: false; error?: string; fieldErrors?: Record<string, string[]> };

function toFieldErrors(issues: { field: string; message: string }[]) {
  return issues.reduce<Record<string, string[]>>((acc, issue) => {
    acc[issue.field] ??= [];
    acc[issue.field].push(issue.message);
    return acc;
  }, {});
}

export async function createAthlete(input: AthleteInput): Promise<ActionState> {
  const session = await requireTecnicoSession();
  console.log("[Athletes] create:start", { userId: session.user.id });

  const parsed = athleteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const result = await createAthleteForCoach(session.user.id, parsed.data);
    if (!result.success) {
      return { success: false, fieldErrors: toFieldErrors(result.issues) };
    }

    console.log("[Athletes] create:success", {
      userId: session.user.id,
      athleteId: result.athleteId,
    });
    revalidatePath("/atleti");
    return { success: true, athleteId: result.athleteId };
  } catch (error) {
    console.error("[Athletes] create:error", { userId: session.user.id, error });
    if (error instanceof AthletesStorageNotReadyError) {
      return {
        success: false,
        error: "Il database non e ancora pronto per gli atleti. Applica prima la migration Prisma.",
      };
    }
    return { success: false, error: "Impossibile creare l'atleta. Riprova." };
  }
}

export async function listAthletes() {
  const session = await requireTecnicoSession();
  return listAthletesForCoach(session.user.id);
}

export async function getAthlete(athleteId: string) {
  const session = await requireTecnicoSession();
  return getAthleteForCoach(athleteId, session.user.id);
}

export async function updateAthlete(athleteId: string, input: AthleteInput): Promise<ActionState> {
  const session = await requireTecnicoSession();
  console.log("[Athletes] update:start", { userId: session.user.id, athleteId });

  const parsed = athleteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const result = await updateAthleteForCoach(athleteId, session.user.id, parsed.data);
    if (!result.success) {
      return { success: false, fieldErrors: toFieldErrors(result.issues) };
    }

    console.log("[Athletes] update:success", { userId: session.user.id, athleteId });
    revalidatePath("/atleti");
    revalidatePath(`/atleti/${athleteId}`);
    return { success: true, athleteId };
  } catch (error) {
    console.error("[Athletes] update:error", { userId: session.user.id, athleteId, error });
    if (error instanceof AthletesStorageNotReadyError) {
      return {
        success: false,
        error: "Il database non e ancora pronto per gli atleti. Applica prima la migration Prisma.",
      };
    }
    return { success: false, error: "Impossibile aggiornare l'atleta. Riprova." };
  }
}

export async function deleteAthlete(athleteId: string): Promise<ActionState> {
  const session = await requireTecnicoSession();
  console.log("[Athletes] delete:start", { userId: session.user.id, athleteId });

  try {
    const deleted = await deleteAthleteForCoach(athleteId, session.user.id);
    if (!deleted) {
      return { success: false, error: "Atleta non trovato." };
    }

    console.log("[Athletes] delete:success", { userId: session.user.id, athleteId });
    revalidatePath("/atleti");
    return { success: true };
  } catch (error) {
    console.error("[Athletes] delete:error", { userId: session.user.id, athleteId, error });
    if (error instanceof AthletesStorageNotReadyError) {
      return {
        success: false,
        error: "Il database non e ancora pronto per gli atleti. Applica prima la migration Prisma.",
      };
    }
    return { success: false, error: "Impossibile eliminare l'atleta. Riprova." };
  }
}
