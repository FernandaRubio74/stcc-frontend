export type DocumentKind = 'SPEC' | 'ARCHITECTURE';

/** Entrada del historial: sin contenido (el backend lo entrega aparte). */
export interface DocumentVersion {
  id: string;
  kind: DocumentKind;
  versionNumber: number;
  createdAt: string;
  createdById: string | null;
}

export interface GeneratedDocument extends DocumentVersion {
  content: string;
}

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  SPEC: 'Especificación del producto',
  ARCHITECTURE: 'Arquitectura definitiva',
};

export const DOCUMENT_KIND_FILENAMES: Record<DocumentKind, string> = {
  SPEC: 'especificacion.md',
  ARCHITECTURE: 'arquitectura.md',
};
