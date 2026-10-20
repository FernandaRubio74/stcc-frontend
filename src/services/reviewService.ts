import { apiFetch } from '../lib/apiClient';
import type { ReviewSummary } from '../types/review';

export function getReviewSummary(projectId: string, token: string): Promise<ReviewSummary> {
  return apiFetch<ReviewSummary>(`/projects/${projectId}/review-summary`, { token });
}

export interface FinalGenerationResult {
  status: string;
  message: string;
}

export function postFinalGeneration(projectId: string, token: string): Promise<FinalGenerationResult> {
  return apiFetch<FinalGenerationResult>(`/projects/${projectId}/consistency-check/final-generation`, {
    method: 'POST',
    token,
  });
}
