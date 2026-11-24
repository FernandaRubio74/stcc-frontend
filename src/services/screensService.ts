import { apiFetch } from '../lib/apiClient';
import type { NavigationEdge, Screen, ScreenMapState, ScreenMapVersionView } from '../types/screens';

export function getScreenMap(projectId: string, token: string): Promise<ScreenMapState> {
  return apiFetch<ScreenMapState>(`/projects/${projectId}/screens`, { token });
}

export function generateScreenMap(projectId: string, token: string): Promise<ScreenMapVersionView> {
  return apiFetch<ScreenMapVersionView>(`/projects/${projectId}/screens/generate`, {
    method: 'POST',
    token,
  });
}

export function refineScreens(projectId: string, instruction: string, token: string): Promise<ScreenMapVersionView> {
  return apiFetch<ScreenMapVersionView>(`/projects/${projectId}/screens/refine`, {
    method: 'POST',
    body: JSON.stringify({ instruction }),
    token,
  });
}

export function updateScreens(
  projectId: string,
  screens: Screen[],
  navigation: NavigationEdge[],
  token: string,
): Promise<ScreenMapVersionView> {
  return apiFetch<ScreenMapVersionView>(`/projects/${projectId}/screens`, {
    method: 'PATCH',
    body: JSON.stringify({ screens, navigation }),
    token,
  });
}

export function approveScreenMapVersion(projectId: string, token: string): Promise<ScreenMapVersionView> {
  return apiFetch<ScreenMapVersionView>(`/projects/${projectId}/screens/approve`, {
    method: 'POST',
    token,
  });
}
