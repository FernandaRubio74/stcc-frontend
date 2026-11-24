import { apiFetch } from '../lib/apiClient';
import type { Project, ProjectDetail, ProjectListItem } from '../types/project';

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export function listProjects(token: string): Promise<ProjectListItem[]> {
  return apiFetch<ProjectListItem[]>('/projects', { token });
}

export function getProject(projectId: string, token: string): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>(`/projects/${projectId}`, { token });
}

export function createProject(payload: CreateProjectPayload, token: string): Promise<Project> {
  return apiFetch<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}
