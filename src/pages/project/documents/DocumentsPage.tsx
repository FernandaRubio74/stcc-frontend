import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { usePageTitle } from '../../../hooks/usePageTitle';
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
import { AppShell } from '../../../components/AppShell';
import { BackLink } from '../../../components/BackLink';
import { PageHeader } from '../../../components/PageHeader';
import { Alert } from '../../../components/Alert';
import { Skeleton } from '../../../components/Skeleton';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { Icon } from '../../../components/icons';
import { useToast } from '../../../components/Toast';

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
  usePageTitle('Documentos finales');
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
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
    setSelectedId((current) =>
      current && versions.some((v) => v.id === current) ? current : versions[0].id,
    );
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

  function onGenerated(documentId: string, message: string) {
    setError(null);
    setBloqueado(false);
    queryClient.invalidateQueries({ queryKey: versionsKey });
    setSelectedId(documentId);
    showToast(message);
  }

  const specMutation = useMutation({
    mutationFn: () => generateSpecDocument(projectId as string, token as string),
    onSuccess: (document) => onGenerated(document.id, 'Especificación generada'),
    onError: handleError,
  });

  const architectureMutation = useMutation({
    mutationFn: () => generateArchitectureDocument(projectId as string, token as string),
    onSuccess: (document) => onGenerated(document.id, 'Arquitectura generada'),
    onError: handleError,
  });

  const bundleMutation = useMutation({
    mutationFn: () => downloadDocumentsBundle(projectId as string, token as string),
    onSuccess: (blob) => {
      setError(null);
      setBloqueado(false);
      descargarArchivo(blob, 'genial-documentos.zip');
      showToast('Descarga lista');
    },
    onError: handleError,
  });

  const versions = versionsQuery.data ?? [];
  const selectedDocument = documentQuery.data ?? null;
  const generando = specMutation.isPending || architectureMutation.isPending;

  return (
    <AppShell>
      <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>

      <PageHeader
        title="Documentos finales"
        subtitle="Los dos documentos Markdown que entrega GENIAL, listos para pasarle a una herramienta de IA externa."
      />

      <div className="flex flex-wrap items-center gap-space-sm rounded-xl bg-surface-container-low p-space-lg shadow-sm">
        <Button
          variant="secondary"
          onClick={() => specMutation.mutate()}
          disabled={generando}
          loading={specMutation.isPending}
        >
          <Icon name="description" className="text-[16px] text-secondary" />
          Generar especificación
        </Button>
        <Button
          variant="secondary"
          onClick={() => architectureMutation.mutate()}
          disabled={generando}
          loading={architectureMutation.isPending}
        >
          <Icon name="schema" className="text-[16px] text-secondary" />
          Generar arquitectura
        </Button>
        <Button
          onClick={() => bundleMutation.mutate()}
          disabled={versions.length === 0}
          loading={bundleMutation.isPending}
          className="ml-auto"
        >
          <Icon name="download" className="text-[16px]" filled />
          Descargar paquete completo (.zip)
        </Button>
      </div>

      {error && (
        <Alert>
          <span>{error}</span>
          {bloqueado && (
            <>
              {' '}
              <Link to={`/projects/${projectId}/review`} className="font-medium underline">
                Ver qué falta en la revisión final
              </Link>
            </>
          )}
        </Alert>
      )}

      {versionsQuery.isPending && (
        <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
          <Skeleton variant="block" />
          <Skeleton variant="block" />
        </div>
      )}

      {versionsQuery.isError && (
        <Alert onRetry={() => versionsQuery.refetch()}>
          No se pudo cargar el historial de documentos
        </Alert>
      )}

      {versionsQuery.isSuccess && (
        <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
          <Card>
            <VersionList versions={versions} selectedId={selectedId} onSelect={setSelectedId} />
          </Card>

          {selectedDocument ? (
            <DocumentViewer
              document={selectedDocument}
              onDownload={() =>
                descargarArchivo(
                  new Blob([selectedDocument.content], {
                    type: 'text/markdown',
                  }),
                  DOCUMENT_KIND_FILENAMES[selectedDocument.kind],
                )
              }
            />
          ) : (
            <EmptyState
              title="Todavía no hay documentos generados"
              description="Generá la especificación y la arquitectura para verlas acá."
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
