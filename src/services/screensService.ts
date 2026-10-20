import { apiFetch } from '../lib/apiClient';
import type { ScreenMapState } from '../types/screens';

export function getScreenMap(projectId: string, token: string): Promise<ScreenMapState | null> {
  return apiFetch<ScreenMapState | null>(`/projects/${projectId}/screens`, { token });
}

export function generateScreenMap(projectId: string, token: string): Promise<ScreenMapState> {
  return apiFetch<ScreenMapState>(`/projects/${projectId}/screens/generate`, {
    method: 'POST',
    token,
  });
}
