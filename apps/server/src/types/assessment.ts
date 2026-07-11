/**
 * Canonical question types used across the assessment builder, launch pad,
 * and reports. Persisted as an enum in Mongoose and mirrored on the client.
 *
 * - `multiple_choice` — single-select from a list of options
 * - `rating_scale`    — numeric rating (1..scaleMax, default 5)
 * - `boolean`         — Yes / No
 * - `open_text`       — free-form short text
 */
export const QUESTION_TYPES = [
  "multiple_choice",
  "rating_scale",
  "boolean",
  "open_text",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

/** Assessment lifecycle. `draft` is edit-only; `published` can be launched. */
export type AssessmentStatus = "draft" | "published";

export interface IQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  scaleMax?: number;
  // Optional answer key. When set, the question is auto-graded on submission.
  // open_text has no correct-answer field (graded via the future AI feature).
  correctOption?: string; // multiple_choice: must equal one of `options`
  correctRating?: number; // rating_scale: 1..scaleMax
  correctBoolean?: boolean; // boolean
}

export interface IFactor {
  id: string;
  title: string;
  icon: string;
  questions: IQuestion[];
}

export interface ICategory {
  id: string;
  title: string;
  description: string;
  factors: IFactor[];
}

export interface IAssessment {
  title: string;
  description?: string;
  status: AssessmentStatus;
  owner: string;
  categories: ICategory[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ----- Responses -----

export interface IAnswer {
  questionId: string;
  type: QuestionType;
  selectedOption?: string;
  ratingValue?: number;
  booleanValue?: boolean;
  textValue?: string;
}

/** Computed grading result for a submitted response. */
export interface IScore {
  earned: number; // number of gradeable questions answered correctly
  max: number; // number of gradeable questions in the response
  percentage: number; // Math.round((earned / max) * 100)
}

export interface IResponse {
  assessment: string;
  respondentName: string;
  respondentEmail: string;
  answers: IAnswer[];
  score?: IScore;
  submittedAt: Date;
}
