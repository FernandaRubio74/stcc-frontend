import { apiFetch } from '../lib/apiClient';
import type { BlockingQuestion, DefinitionState, PostDefinitionMessageResult } from '../types/definition';

export function getDefinition(projectId: string, token: string): Promise<DefinitionState> {
  return apiFetch<DefinitionState>(`/projects/${projectId}/definition`, { token });
}

export function postDefinitionMessage(
  projectId: string,
  content: string,
  token: string,
): Promise<PostDefinitionMessageResult> {
  return apiFetch<PostDefinitionMessageResult>(`/projects/${projectId}/definition/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
    token,
  });
}

export function listBlockingQuestions(projectId: string, token: string): Promise<BlockingQuestion[]> {
  return apiFetch<BlockingQuestion[]>(`/projects/${projectId}/definition/blocking-questions`, { token });
}

export function advanceDefinitionStage(projectId: string, token: string): Promise<DefinitionState> {
  return apiFetch<DefinitionState>(`/projects/${projectId}/definition/advance`, {
    method: 'POST',
    token,
  });
}
