import { z } from "zod";

const attrezzoSchema = z.enum(["CL", "CM", "AN", "VT", "PP", "SB"]);
const roleSchema = z.enum(["STANDARD", "USCITA", "VOLTEGGIO"]);

export const exerciseElementSchema = z.object({
  elementId: z.string().min(1, "Seleziona un elemento."),
  order: z.number().int().positive("L'ordine deve essere maggiore di zero."),
  role: roleSchema.nullish(),
  notes: z.string().max(500, "Le note possono contenere al massimo 500 caratteri.").nullish(),
});

export const exerciseSchema = z.object({
  name: z.string().trim().min(1, "Il nome dell'esercizio è obbligatorio."),
  attrezzo: attrezzoSchema,
  notes: z.string().max(1000, "Le note possono contenere al massimo 1000 caratteri.").nullish(),
  elements: z.array(exerciseElementSchema).min(1, "Aggiungi almeno un elemento."),
});
