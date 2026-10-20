import { apiFetch } from '../lib/apiClient';
import type { ApiSpecState, ApiSpecVersionView, Endpoint } from '../types/apiSpec';

export function getApiSpec(projectId: string, token: string): Promise<ApiSpecState> {
  return apiFetch<ApiSpecState>(`/projects/${projectId}/api-spec`, { token });
}

export function generateApiSpec(projectId: string, token: string): Promise<ApiSpecVersionView> {
  return apiFetch<ApiSpecVersionView>(`/projects/${projectId}/api-spec/generate`, {
    method: 'POST',
    token,
  });
}

export function updateApiSpecEndpoints(
  projectId: string,
  endpoints: Endpoint[],
  token: string,
): Promise<ApiSpecVersionView> {
  return apiFetch<ApiSpecVersionView>(`/projects/${projectId}/api-spec/endpoints`, {
    method: 'PATCH',
    body: JSON.stringify({ endpoints }),
    token,
  });
}

export function approveApiSpecVersion(projectId: string, token: string): Promise<ApiSpecVersionView> {
  return apiFetch<ApiSpecVersionView>(`/projects/${projectId}/api-spec/approve`, {
    method: 'POST',
    token,
  });
}
