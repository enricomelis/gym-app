"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";

const registerSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
});

type RegisterResult = { success: true } | { success: false; error: string };

export async function registerUser(data: z.infer<typeof registerSchema>): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { name, email, password } = parsed.data;

  try {
    await auth.api.signUpEmail({
      body: { name, email, password, role: "TECNICO" },
    });
  } catch (error) {
    if (error instanceof APIError) {
      if (error.body?.code === "USER_ALREADY_EXISTS") {
        return { success: false, error: "Email già registrata" };
      }
      return { success: false, error: error.body?.message ?? "Registrazione fallita" };
    }
    return { success: false, error: "Registrazione fallita" };
  }

  return { success: true };
}
