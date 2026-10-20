import { apiFetch } from '../lib/apiClient';
import type { DataModelState, DataModelVersionView, Entity } from '../types/dataModel';

export function getDataModel(projectId: string, token: string): Promise<DataModelState> {
  return apiFetch<DataModelState>(`/projects/${projectId}/data-model`, { token });
}

export function generateDataModel(projectId: string, token: string): Promise<DataModelVersionView> {
  return apiFetch<DataModelVersionView>(`/projects/${projectId}/data-model/generate`, {
    method: 'POST',
    token,
  });
}

export function updateDataModelEntities(
  projectId: string,
  entities: Entity[],
  token: string,
): Promise<DataModelVersionView> {
  return apiFetch<DataModelVersionView>(`/projects/${projectId}/data-model/entities`, {
    method: 'PATCH',
    body: JSON.stringify({ entities }),
    token,
  });
}

export function approveDataModelVersion(projectId: string, token: string): Promise<DataModelVersionView> {
  return apiFetch<DataModelVersionView>(`/projects/${projectId}/data-model/approve`, {
    method: 'POST',
    token,
  });
}
