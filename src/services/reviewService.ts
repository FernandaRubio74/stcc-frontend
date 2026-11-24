import { apiFetch } from '../lib/apiClient';
import type { ConsistencyCheck, ConsistencyStatus, Inconsistency, ReviewSummary } from '../types/review';

export function getReviewSummary(projectId: string, token: string): Promise<ReviewSummary> {
  return apiFetch<ReviewSummary>(`/projects/${projectId}/review-summary`, { token });
}

export interface ConsistencyCheckResult {
  issues: Inconsistency[];
  /** false solo si hay hallazgos de estado "error": una advertencia no bloquea. */
  isConsistent: boolean;
  /** Campos aditivos; opcionales para tolerar una respuesta vieja. */
  status?: ConsistencyStatus;
  checks?: ConsistencyCheck[];
  /** Etapas que todavia no se generaron: son "pendiente", no un problema. */
  pendingStages?: string[];
  /** Etapas con un borrador sin aprobar: el motor solo mira lo aprobado. */
  pendingApproval?: string[];
}

// Mas liviano que getReviewSummary (que ademas agrega el progreso de cada
// etapa): lo usan las paginas de etapa individuales para mostrar, en el
// lugar donde hay que resolverlo, una inconsistencia que involucra esa
// etapa - no solo en la Revision final.
export function getConsistencyCheck(projectId: string, token: string): Promise<ConsistencyCheckResult> {
  return apiFetch<ConsistencyCheckResult>(`/projects/${projectId}/consistency-check`, { token });
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
