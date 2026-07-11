import type { IAnswer, IQuestion, IScore } from "../types/assessment.js";

/**
 * A question is "gradeable" iff it carries an answer key. multiple_choice,
 * rating_scale and boolean can be graded (exact match); open_text never is
 * (it needs semantic comparison — the future paid AI feature).
 */
function isGradeable(q: Pick<IQuestion, "type" | "correctOption" | "correctRating" | "correctBoolean">): boolean {
  switch (q.type) {
    case "multiple_choice":
      return typeof q.correctOption === "string" && q.correctOption.trim().length > 0;
    case "rating_scale":
      return typeof q.correctRating === "number";
    case "boolean":
      return typeof q.correctBoolean === "boolean";
    case "open_text":
    default:
      return false;
  }
}

/** True when the submitted answer exactly matches the question's answer key. */
function isCorrect(q: IQuestion, answer: IAnswer): boolean {
  switch (q.type) {
    case "multiple_choice":
      return answer.selectedOption === q.correctOption;
    case "rating_scale":
      return answer.ratingValue === q.correctRating;
    case "boolean":
      return answer.booleanValue === q.correctBoolean;
    default:
      return false;
  }
}

/**
 * Evaluate a submitted set of answers against an assessment's answer keys.
 * Returns `{ earned, max, percentage }`, or `null` when the assessment has no
 * gradeable questions (purely informational).
 */
export function scoreAnswers(
  assessment: { categories: { factors: { questions: IQuestion[] }[] }[] },
  answers: IAnswer[]
): IScore | null {
  const answerByQuestion = new Map<string, IAnswer>();
  for (const a of answers) answerByQuestion.set(a.questionId, a);

  let earned = 0;
  let max = 0;
  for (const cat of assessment.categories) {
    for (const factor of cat.factors) {
      for (const q of factor.questions) {
        if (!isGradeable(q)) continue;
        max += 1;
        const answer = answerByQuestion.get(q.id);
        if (answer && isCorrect(q, answer)) earned += 1;
      }
    }
  }

  if (max === 0) return null;
  return { earned, max, percentage: Math.round((earned / max) * 100) };
}
