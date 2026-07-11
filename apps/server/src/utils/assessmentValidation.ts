import { QUESTION_TYPES, type QuestionType } from "../types/assessment.js";
import type { ValidationResult } from "./validation.js";

function isQuestionType(value: unknown): value is QuestionType {
  return typeof value === "string" && (QUESTION_TYPES as readonly string[]).includes(value);
}

/**
 * Validate an assessment creation/update payload (the shape sent by the
 * builder). Ensures titles exist on every level and that multiple_choice
 * questions carry at least two options.
 */
export function validateAssessmentInput(input: {
  title?: string;
  categories?: unknown[];
}): ValidationResult {
  const title = input.title?.trim() ?? "";
  if (!title) return { valid: false, message: "Assessment title is required." };

  const categories = Array.isArray(input.categories) ? input.categories : [];
  if (categories.length === 0) {
    return { valid: false, message: "At least one category is required." };
  }

  let totalQuestions = 0;

  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci] as { title?: string; factors?: unknown[] };
    if (!cat.title?.trim()) {
      return { valid: false, message: `Category #${ci + 1} is missing a title.` };
    }
    const factors = Array.isArray(cat.factors) ? cat.factors : [];
    for (let fi = 0; fi < factors.length; fi++) {
      const factor = factors[fi] as { title?: string; questions?: unknown[] };
      if (!factor.title?.trim()) {
        return {
          valid: false,
          message: `Factor #${fi + 1} in "${cat.title}" is missing a title.`,
        };
      }
      const questions = Array.isArray(factor.questions) ? factor.questions : [];
      for (let qi = 0; qi < questions.length; qi++) {
        const q = questions[qi] as {
          text?: string;
          type?: string;
          options?: unknown;
        };
        if (!q.text?.trim()) {
          return {
            valid: false,
            message: `Question #${qi + 1} in "${factor.title}" is missing text.`,
          };
        }
        if (!isQuestionType(q.type)) {
          return {
            valid: false,
            message: `Question #${qi + 1} in "${factor.title}" has an invalid type.`,
          };
        }
        if (q.type === "multiple_choice") {
          const opts = Array.isArray(q.options) ? (q.options as string[]) : [];
          const nonEmpty = opts.filter((o) => typeof o === "string" && o.trim());
          if (nonEmpty.length < 2) {
            return {
              valid: false,
              message: `Multiple-choice question #${qi + 1} in "${factor.title}" needs at least two options.`,
            };
          }
        }
        totalQuestions += 1;
      }
    }
  }

  if (totalQuestions === 0) {
    return { valid: false, message: "At least one question is required." };
  }

  return { valid: true };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate the respondent identity captured at submission time. Assessments are
 * taken without an account, so a name and a valid email are required.
 */
export function validateRespondent(input: {
  name?: string;
  email?: string;
}): ValidationResult {
  if (!input.name?.trim()) return { valid: false, message: "Name is required." };
  const email = input.email?.trim() ?? "";
  if (!email) return { valid: false, message: "Email is required." };
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: "Please enter a valid email address." };
  }
  return { valid: true };
}

/**
 * Validate a submitted response payload. Each answer must specify its value
 * field according to its declared type.
 */
export function validateResponseInput(input: {
  answers?: unknown[];
}): ValidationResult {
  const answers = Array.isArray(input.answers) ? input.answers : [];
  if (answers.length === 0) {
    return { valid: false, message: "At least one answer is required." };
  }

  for (let i = 0; i < answers.length; i++) {
    const a = answers[i] as {
      questionId?: string;
      type?: string;
      selectedOption?: string;
      ratingValue?: number;
      booleanValue?: boolean;
      textValue?: string;
    };
    if (!a.questionId?.trim()) {
      return { valid: false, message: `Answer #${i + 1} is missing a questionId.` };
    }
    if (!isQuestionType(a.type)) {
      return { valid: false, message: `Answer #${i + 1} has an invalid type.` };
    }

    switch (a.type as QuestionType) {
      case "multiple_choice":
        if (typeof a.selectedOption !== "string" || !a.selectedOption.trim()) {
          return { valid: false, message: `Answer #${i + 1} must select an option.` };
        }
        break;
      case "rating_scale":
        if (typeof a.ratingValue !== "number" || Number.isNaN(a.ratingValue)) {
          return { valid: false, message: `Answer #${i + 1} must provide a rating.` };
        }
        break;
      case "boolean":
        if (typeof a.booleanValue !== "boolean") {
          return { valid: false, message: `Answer #${i + 1} must be Yes or No.` };
        }
        break;
      case "open_text":
        if (typeof a.textValue !== "string" || !a.textValue.trim()) {
          return { valid: false, message: `Answer #${i + 1} must provide text.` };
        }
        break;
    }
  }

  return { valid: true };
}
