import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { ApiError } from '../../../lib/apiClient';
import {
  downloadDocumentsBundle,
  generateArchitectureDocument,
  generateSpecDocument,
  getDocument,
  listDocuments,
} from '../../../services/documentsService';
import { DOCUMENT_KIND_FILENAMES } from '../../../types/documents';
import { DocumentViewer } from './DocumentViewer';
import { VersionList } from './VersionList';

function descargarArchivo(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

// US-037: contenedor de la etapa de cierre. Las dos generaciones pueden
// rechazarse con 409 si el proyecto no esta listo (US-035/US-036); en ese caso
// se muestra el motivo y se ofrece ir a la revision final, que es donde se ve
// el detalle de los bloqueos.
export function DocumentsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bloqueado, setBloqueado] = useState(false);

  const versionsKey = ['project', projectId, 'documents'];

  const versionsQuery = useQuery({
    queryKey: versionsKey,
    queryFn: () => listDocuments(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  // Por defecto se muestra la version mas reciente; si la seleccionada
  // desaparece (o todavia no hay ninguna), se recalcula.
  useEffect(() => {
    const versions = versionsQuery.data;
    if (!versions || versions.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((current) => (current && versions.some((v) => v.id === current) ? current : versions[0].id));
  }, [versionsQuery.data]);

  const documentQuery = useQuery({
    queryKey: ['project', projectId, 'document', selectedId],
    queryFn: () => getDocument(projectId as string, selectedId as string, token as string),
    enabled: Boolean(token && projectId && selectedId),
  });

  function handleError(err: unknown) {
    const apiError = err instanceof ApiError ? err : null;
    setBloqueado(apiError?.status === 409);
    setError(apiError ? apiError.message : 'Ocurrió un error inesperado');
  }

  function onGenerated(documentId: string) {
    setError(null);
    setBloqueado(false);
    queryClient.invalidateQueries({ queryKey: versionsKey });
    setSelectedId(documentId);
  }

  const specMutation = useMutation({
    mutationFn: () => generateSpecDocument(projectId as string, token as string),
    onSuccess: (document) => onGenerated(document.id),
    onError: handleError,
  });

  const architectureMutation = useMutation({
    mutationFn: () => generateArchitectureDocument(projectId as string, token as string),
    onSuccess: (document) => onGenerated(document.id),
    onError: handleError,
  });

  const bundleMutation = useMutation({
    mutationFn: () => downloadDocumentsBundle(projectId as string, token as string),
    onSuccess: (blob) => {
      setError(null);
      setBloqueado(false);
      descargarArchivo(blob, 'ideator-documentos.zip');
    },
    onError: handleError,
  });

  const versions = versionsQuery.data ?? [];
  const selectedDocument = documentQuery.data ?? null;
  const generando = specMutation.isPending || architectureMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link to={`/projects/${projectId}`} className="text-sm text-indigo-600 hover:underline">
          ← Volver al proyecto
        </Link>

        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">Documentos finales</h1>
          <p className="text-sm text-gray-600">
            Los dos documentos Markdown que entrega Ideator, listos para pasarle a una herramienta de IA externa.
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => specMutation.mutate()}
            disabled={generando}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {specMutation.isPending ? 'Generando…' : 'Generar especificación'}
          </button>
          <button
            type="button"
            onClick={() => architectureMutation.mutate()}
            disabled={generando}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {architectureMutation.isPending ? 'Generando…' : 'Generar arquitectura'}
          </button>
          <button
            type="button"
            onClick={() => bundleMutation.mutate()}
            disabled={bundleMutation.isPending || versions.length === 0}
            className="rounded-md border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bundleMutation.isPending ? 'Preparando…' : 'Descargar ambos (.zip)'}
          </button>
        </div>

        {error && (
          <div role="alert" className="space-y-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            <p>{error}</p>
            {bloqueado && (
              <Link to={`/projects/${projectId}/review`} className="font-medium underline">
                Ver qué falta en la revisión final
              </Link>
            )}
          </div>
        )}

        {versionsQuery.isPending ? (
          <p className="text-sm text-gray-500">Cargando…</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
            <aside className="rounded-md border border-gray-200 bg-white p-3">
              <VersionList versions={versions} selectedId={selectedId} onSelect={setSelectedId} />
            </aside>

            {selectedDocument ? (
              <DocumentViewer
                document={selectedDocument}
                onDownload={() =>
                  descargarArchivo(
                    new Blob([selectedDocument.content], { type: 'text/markdown' }),
                    DOCUMENT_KIND_FILENAMES[selectedDocument.kind]
                  )
                }
              />
            ) : (
              <p className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                Todavía no hay documentos generados para este proyecto. Generá la especificación y la arquitectura para
                verlas acá.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
