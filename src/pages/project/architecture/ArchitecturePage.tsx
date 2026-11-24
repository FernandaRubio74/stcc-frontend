import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { getProject } from '../../../services/projectsService';
import {
  getArchitecture,
  getArchitectureCatalog,
  recommendArchitecture,
  selectArchitecture,
} from '../../../services/architectureService';
import { ApiError } from '../../../lib/apiClient';
import { ArchitectureSelector } from './ArchitectureSelector';
import { AppShell } from '../../../components/AppShell';
import { BackLink } from '../../../components/BackLink';
import { PageHeader } from '../../../components/PageHeader';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { Skeleton } from '../../../components/Skeleton';
import { Icon } from '../../../components/icons';
import { useToast } from '../../../components/Toast';
import { StageAssistant } from '../../../components/StageAssistant';
import { getNextStagePath } from '../projectStages';

// STCC-152 (US-030): pagina de seleccion de arquitectura — vista
// comparativa de las 5 opciones del catalogo (US-028/US-029), con la
// recomendacion de la IA resaltada y el flujo de aceptarla o elegir otra.
export function ArchitecturePage() {
  usePageTitle('Arquitectura');
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [recommendError, setRecommendError] = useState<string | null>(null);
  const [selectError, setSelectError] = useState<string | null>(null);

  const architectureQueryKey = ['project', projectId, 'architecture'];
  const catalogQueryKey = ['project', projectId, 'architecture', 'catalog'];

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  const catalogQuery = useQuery({
    queryKey: catalogQueryKey,
    queryFn: () => getArchitectureCatalog(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  const architectureQuery = useQuery({
    queryKey: architectureQueryKey,
    queryFn: () => getArchitecture(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: architectureQueryKey });
  }

  async function handleRefine(instruction: string) {
    await recommendArchitecture(projectId as string, token as string, instruction);
    invalidate();
    showToast('Recomendación actualizada');
  }

  const recommendMutation = useMutation({
    mutationFn: () => recommendArchitecture(projectId as string, token as string),
    onSuccess: () => {
      setRecommendError(null);
      invalidate();
      showToast('Arquitectura recomendada');
    },
    onError: (error: unknown) => {
      setRecommendError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  const selectMutation = useMutation({
    mutationFn: (architectureId: string) =>
      selectArchitecture(projectId as string, architectureId, token as string),
    onSuccess: () => {
      setSelectError(null);
      invalidate();
      showToast('Arquitectura confirmada');
      const nextPath = getNextStagePath(projectId as string, 'architecture');
      if (nextPath) navigate(nextPath);
    },
    onError: (error: unknown) => {
      setSelectError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  if (projectQuery.isPending || catalogQuery.isPending || architectureQuery.isPending) {
    return (
      <AppShell>
        <Skeleton variant="text" className="w-48" />
        <Skeleton variant="block" />
      </AppShell>
    );
  }

  if (
    projectQuery.isError ||
    !projectQuery.data ||
    catalogQuery.isError ||
    !catalogQuery.data ||
    architectureQuery.isError ||
    !architectureQuery.data
  ) {
    return (
      <AppShell>
        <Alert
          onRetry={() => {
            projectQuery.refetch();
            catalogQuery.refetch();
            architectureQuery.refetch();
          }}
        >
          No se pudo cargar la seleccion de arquitectura
        </Alert>
        <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>
      </AppShell>
    );
  }

  const role = projectQuery.data.role;
  const canRecommend = role === 'owner' || role === 'editor';
  const canSelect = role === 'owner';
  const state = architectureQuery.data;

  return (
    <AppShell breadcrumb={projectQuery.data.name}>
      <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>

      <PageHeader
        title="Arquitectura tecnológica"
        actions={
          canRecommend && (
            <Button
              onClick={() => recommendMutation.mutate()}
              loading={recommendMutation.isPending}
            >
              <Icon name="auto_awesome" className="text-[16px]" />
              {state.recommendedId ? 'Volver a recomendar' : 'Recomendar con IA'}
            </Button>
          )
        }
      />

      {recommendError && <Alert>{recommendError}</Alert>}
      {selectError && <Alert>{selectError}</Alert>}

      {state.selectedId && (
        <div className="flex items-center gap-2 rounded-lg bg-tertiary-container/20 px-space-md py-space-sm text-label-md text-tertiary">
          <Icon name="verified" className="text-[18px]" />
          Arquitectura confirmada: <span className="font-mono text-code-sm">{state.selectedId}</span>
        </div>
      )}

      {canRecommend && !state.selectedId && (
        <StageAssistant
          id="architecture"
          placeholder='Ej: "Prefiero algo lo más simple posible, sin microservicios"'
          onSubmit={handleRefine}
        />
      )}

      <ArchitectureSelector
        catalog={catalogQuery.data}
        state={state}
        canSelect={canSelect}
        onSelect={(architectureId) => selectMutation.mutate(architectureId)}
        isSelecting={selectMutation.isPending}
      />
    </AppShell>
  );
}
