import { apiFetch } from '../lib/apiClient';
import type { ArchitectureScenario, ArchitectureState } from '../types/architecture';

export function getArchitectureCatalog(projectId: string, token: string): Promise<ArchitectureScenario[]> {
  return apiFetch<ArchitectureScenario[]>(`/projects/${projectId}/architecture/catalog`, { token });
}

export function getArchitecture(projectId: string, token: string): Promise<ArchitectureState> {
  return apiFetch<ArchitectureState>(`/projects/${projectId}/architecture`, { token });
}

export function recommendArchitecture(projectId: string, token: string): Promise<ArchitectureState> {
  return apiFetch<ArchitectureState>(`/projects/${projectId}/architecture/recommend`, {
    method: 'POST',
    token,
  });
}

export function selectArchitecture(
  projectId: string,
  architectureId: string,
  token: string,
): Promise<ArchitectureState> {
  return apiFetch<ArchitectureState>(`/projects/${projectId}/architecture/select`, {
    method: 'POST',
    body: JSON.stringify({ architectureId }),
    token,
  });
}
