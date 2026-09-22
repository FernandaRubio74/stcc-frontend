import { apiFetch } from '../lib/apiClient';
import type { ProjectMember, ProjectRole } from '../types/project';

export interface InviteMemberPayload {
  email: string;
  role: ProjectRole;
}

export function listMembers(projectId: string, token: string): Promise<ProjectMember[]> {
  return apiFetch<ProjectMember[]>(`/projects/${projectId}/members`, { token });
}

export function inviteMember(
  projectId: string,
  payload: InviteMemberPayload,
  token: string,
): Promise<ProjectMember> {
  return apiFetch<ProjectMember>(`/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function updateMemberRole(
  projectId: string,
  memberId: string,
  role: ProjectRole,
  token: string,
): Promise<ProjectMember> {
  return apiFetch<ProjectMember>(`/projects/${projectId}/members/${memberId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
    token,
  });
}

export function removeMember(projectId: string, memberId: string, token: string): Promise<null> {
  return apiFetch<null>(`/projects/${projectId}/members/${memberId}`, {
    method: 'DELETE',
    token,
  });
}
