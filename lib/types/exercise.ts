import type { Attrezzo, ElementoCdp } from "@/lib/types/cdp";

export type ExerciseElementRole = "STANDARD" | "USCITA" | "VOLTEGGIO";

export interface ExerciseElementInput {
  elementId: string;
  order: number;
  role?: ExerciseElementRole | null;
  notes?: string | null;
}

export interface ExerciseInput {
  name: string;
  attrezzo: Attrezzo;
  notes?: string | null;
  elements: ExerciseElementInput[];
}

export interface ExerciseValidationIssue {
  field: string;
  message: string;
}

export interface ResolvedExerciseElement extends ExerciseElementInput {
  role: ExerciseElementRole;
  element: ElementoCdp;
}

export interface ExerciseSummary {
  id: string;
  name: string;
  attrezzo: Attrezzo;
  notes: string | null;
  updatedAt: Date;
  createdAt: Date;
  elementCount: number;
  dScore: number;
}

export interface ExerciseDetail extends ExerciseSummary {
  elements: ResolvedExerciseElement[];
}
