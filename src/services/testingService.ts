import { apiFetch } from '../lib/apiClient';
import type { TestPlanContent, TestPlanState, TestPlanVersionView } from '../types/testing';

export function getTestPlan(projectId: string, token: string): Promise<TestPlanState> {
  return apiFetch<TestPlanState>(`/projects/${projectId}/testing`, { token });
}

export function generateTestPlan(projectId: string, token: string): Promise<TestPlanVersionView> {
  return apiFetch<TestPlanVersionView>(`/projects/${projectId}/testing/generate`, {
    method: 'POST',
    token,
  });
}

export function refineTestPlan(projectId: string, instruction: string, token: string): Promise<TestPlanVersionView> {
  return apiFetch<TestPlanVersionView>(`/projects/${projectId}/testing/refine`, {
    method: 'POST',
    body: JSON.stringify({ instruction }),
    token,
  });
}

export function updateTestPlanContent(
  projectId: string,
  content: TestPlanContent,
  token: string,
): Promise<TestPlanVersionView> {
  return apiFetch<TestPlanVersionView>(`/projects/${projectId}/testing/content`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
    token,
  });
}

export function approveTestPlanVersion(projectId: string, token: string): Promise<TestPlanVersionView> {
  return apiFetch<TestPlanVersionView>(`/projects/${projectId}/testing/approve`, {
    method: 'POST',
    token,
  });
}
