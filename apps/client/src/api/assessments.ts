import { apiFetch } from "./client";
import type {
  Assessment,
  AssessmentPayload,
  AssessmentStatus,
  AssessmentSummary,
  CategoryLibraryEntry,
  ResponseSummary,
} from "../types/assessment";

// ----- Assessments -----

interface ListResponse {
  assessments: AssessmentSummary[];
}
export function listAssessments() {
  return apiFetch<ListResponse>("/api/assessments");
}

interface GetResponse {
  assessment: Assessment;
}
export function getAssessment(id: string) {
  return apiFetch<GetResponse>(`/api/assessments/${id}`);
}

export function createAssessment(payload: AssessmentPayload) {
  return apiFetch<GetResponse>("/api/assessments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAssessment(id: string, payload: AssessmentPayload) {
  return apiFetch<GetResponse>(`/api/assessments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAssessment(id: string) {
  return apiFetch<{ message: string }>(`/api/assessments/${id}`, {
    method: "DELETE",
  });
}

export function setAssessmentStatus(id: string, status: AssessmentStatus) {
  return apiFetch<{ id: string; status: AssessmentStatus }>(
    `/api/assessments/${id}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) }
  );
}

// ----- Category library (builder "Load Categories") -----

interface CategoryLibraryResponse {
  library: CategoryLibraryEntry[];
}
export function loadCategoryLibrary() {
  return apiFetch<CategoryLibraryResponse>("/api/assessments/categories/library");
}

// ----- Responses -----

interface ResponsesListResponse {
  responses: ResponseSummary[];
}
export function listResponses(assessmentId: string) {
  return apiFetch<ResponsesListResponse>(
    `/api/assessments/${assessmentId}/responses`
  );
}
