import type { AthleteInput, AthleteValidationIssue } from "@/lib/types/athlete";

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface PreparedAthleteInput {
  firstName: string;
  lastName: string;
  normalizedFirstName: string;
  normalizedLastName: string;
  birthDate: Date;
  tesseraNumber: string | null;
  normalizedTesseraNumber: string | null;
}

export function normalizeAthleteText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeTesseraNumber(value?: string | null): string | null {
  const normalized = normalizeAthleteText(value ?? "");
  return normalized ? normalized.toUpperCase() : null;
}

export function toDateInputValue(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): Date | null {
  if (!DATE_INPUT_PATTERN.test(value)) {
    return null;
  }

  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function getTodayInputValue(now: Date): string {
  return toDateInputValue(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())),
  );
}

export function prepareAthleteInput(
  input: AthleteInput,
  now = new Date(),
):
  | { success: true; data: PreparedAthleteInput }
  | { success: false; issues: AthleteValidationIssue[] } {
  const issues: AthleteValidationIssue[] = [];
  const firstName = normalizeAthleteText(input.firstName);
  const lastName = normalizeAthleteText(input.lastName);
  const tesseraNumber = normalizeAthleteText(input.tesseraNumber ?? "");
  const birthDate = parseDateInput(input.birthDate);

  if (!firstName) {
    issues.push({ field: "firstName", message: "Il nome e obbligatorio." });
  } else if (firstName.length > 80) {
    issues.push({ field: "firstName", message: "Il nome puo contenere al massimo 80 caratteri." });
  }

  if (!lastName) {
    issues.push({ field: "lastName", message: "Il cognome e obbligatorio." });
  } else if (lastName.length > 80) {
    issues.push({
      field: "lastName",
      message: "Il cognome puo contenere al massimo 80 caratteri.",
    });
  }

  if (!birthDate) {
    issues.push({ field: "birthDate", message: "Inserisci una data di nascita valida." });
  } else if (toDateInputValue(birthDate) >= getTodayInputValue(now)) {
    issues.push({
      field: "birthDate",
      message: "La data di nascita deve essere precedente a oggi.",
    });
  }

  if (tesseraNumber.length > 50) {
    issues.push({
      field: "tesseraNumber",
      message: "Il numero tessera puo contenere al massimo 50 caratteri.",
    });
  }

  if (issues.length > 0 || !birthDate) {
    return { success: false, issues };
  }

  return {
    success: true,
    data: {
      firstName,
      lastName,
      normalizedFirstName: firstName.toLocaleLowerCase("it-IT"),
      normalizedLastName: lastName.toLocaleLowerCase("it-IT"),
      birthDate,
      tesseraNumber: tesseraNumber || null,
      normalizedTesseraNumber: normalizeTesseraNumber(tesseraNumber),
    },
  };
}
