export class ExercisesStorageNotReadyError extends Error {
  constructor() {
    super("La tabella degli esercizi non e ancora disponibile nel database.");
    this.name = "ExercisesStorageNotReadyError";
  }
}

export function isMissingExercisesTableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("The table `public.Exercise` does not exist") ||
    error.message.includes('The table `public."Exercise"` does not exist') ||
    error.message.includes("P2021")
  );
}
