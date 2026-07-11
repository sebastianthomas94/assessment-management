import { apiFetch } from "./client";
import type { Answer, Assessment, Score } from "../types/assessment";

/**
 * Public (unauthenticated) endpoints used by the assessment taker. Respondents
 * do not log in — they submit with a name + email.
 */

interface GetResponse {
  assessment: Assessment;
}
export function getPublicAssessment(id: string) {
  return apiFetch<GetResponse>(`/api/public/assessments/${id}`);
}

export function submitPublicResponse(
  id: string,
  payload: { name: string; email: string; answers: Answer[] }
) {
  return apiFetch<{ response: { id: string; score: Score | null; submittedAt: string } }>(
    `/api/public/assessments/${id}/responses`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}
