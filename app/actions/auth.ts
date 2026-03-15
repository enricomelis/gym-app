"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { registerSchema, loginSchema } from "@/app/actions/schemas";

type AuthResult =
  | { success: true }
  | { success: false; error?: string; fieldErrors?: Record<string, string[]> };

export async function registerUser(data: z.infer<typeof registerSchema>): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      if (error.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
        return {
          success: false,
          error: "Esiste già un account con questa email. Prova ad accedere.",
        };
      }
      return { success: false, error: "Registrazione fallita. Riprova più tardi." };
    }
    return { success: false, error: "Registrazione fallita" };
  }

  return { success: true };
}

export async function loginUser(data: z.infer<typeof loginSchema>): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      if (error.body?.code === "INVALID_EMAIL_OR_PASSWORD") {
        return {
          success: false,
          error: "Email o password non validi.",
        };
      }
      return { success: false, error: "Accesso fallito. Riprova più tardi." };
    }
    return { success: false, error: "Accesso fallito." };
  }

  return { success: true };
}
