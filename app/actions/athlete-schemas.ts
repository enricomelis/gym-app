import { z } from "zod";

export const athleteSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Il nome e obbligatorio.")
    .max(80, "Il nome puo contenere al massimo 80 caratteri."),
  lastName: z
    .string()
    .trim()
    .min(1, "Il cognome e obbligatorio.")
    .max(80, "Il cognome puo contenere al massimo 80 caratteri."),
  birthDate: z.string().trim().min(1, "La data di nascita e obbligatoria."),
  tesseraNumber: z
    .string()
    .max(50, "Il numero tessera puo contenere al massimo 50 caratteri.")
    .nullish(),
});
