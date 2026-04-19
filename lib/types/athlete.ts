export interface AthleteInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  tesseraNumber?: string | null;
}

export interface AthleteValidationIssue {
  field: string;
  message: string;
}

export interface AthleteSummary {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  tesseraNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AthleteDetail = AthleteSummary;
