import { apiFetch, apiFetchBlob } from '../lib/apiClient';
import type { DocumentVersion, GeneratedDocument } from '../types/documents';

export function listDocuments(projectId: string, token: string): Promise<DocumentVersion[]> {
  return apiFetch<DocumentVersion[]>(`/projects/${projectId}/documents`, { token });
}

export function getDocument(projectId: string, documentId: string, token: string): Promise<GeneratedDocument> {
  return apiFetch<GeneratedDocument>(`/projects/${projectId}/documents/${documentId}`, { token });
}

export function generateSpecDocument(projectId: string, token: string): Promise<GeneratedDocument> {
  return apiFetch<GeneratedDocument>(`/projects/${projectId}/documents/spec`, { method: 'POST', token });
}

export function generateArchitectureDocument(projectId: string, token: string): Promise<GeneratedDocument> {
  return apiFetch<GeneratedDocument>(`/projects/${projectId}/documents/architecture`, { method: 'POST', token });
}

/** Descarga conjunta (US-036 T-036.3): el backend arma el zip. */
export function downloadDocumentsBundle(projectId: string, token: string): Promise<Blob> {
  return apiFetchBlob(`/projects/${projectId}/documents/bundle`, { token });
}
