export class AthletesStorageNotReadyError extends Error {
  constructor() {
    super("La tabella degli atleti non e ancora disponibile nel database.");
    this.name = "AthletesStorageNotReadyError";
  }
}

export function isMissingAthletesTableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("The table `public.Athlete` does not exist") ||
    error.message.includes('The table `public."Athlete"` does not exist') ||
    error.message.includes("P2021")
  );
}
