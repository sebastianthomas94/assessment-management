/**
 * Shared domain types for the assessment client. Mirrors the backend
 * `apps/server/src/types/assessment.ts` so the builder, dashboard, launch
 * pad, and reports all speak the same language.
 */
export const QUESTION_TYPES = [
  "multiple_choice",
  "rating_scale",
  "boolean",
  "open_text",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export type AssessmentStatus = "draft" | "published";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  scaleMax?: number;
}

export interface Factor {
  id: string;
  title: string;
  icon: string;
  questions: Question[];
}

export interface Category {
  id: string;
  title: string;
  description: string;
  factors: Factor[];
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  status: AssessmentStatus;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

/** Lean row used by the assessments list endpoint. */
export interface AssessmentSummary {
  id: string;
  title: string;
  description: string;
  status: AssessmentStatus;
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

// ----- Responses -----

export interface Answer {
  questionId: string;
  type: QuestionType;
  selectedOption?: string;
  ratingValue?: number;
  booleanValue?: boolean;
  textValue?: string;
}

export interface ResponseSummary {
  id: string;
  respondent: { name: string; email: string };
  answers: Answer[];
  submittedAt: string;
}

/** A saved category from a previous assessment, for the builder's Load Categories. */
export interface CategoryLibraryEntry {
  assessmentId: string;
  assessmentTitle: string;
  category: Category;
}

// ----- Builder payload (POST/PUT body) -----

export interface AssessmentPayload {
  title: string;
  description: string;
  categories: Category[];
}
