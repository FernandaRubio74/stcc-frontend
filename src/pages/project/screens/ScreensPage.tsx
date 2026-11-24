import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { getProject } from '../../../services/projectsService';
import {
  approveScreenMapVersion,
  generateScreenMap,
  getScreenMap,
  refineScreens,
} from '../../../services/screensService';
import { StageAssistant } from '../../../components/StageAssistant';
import { StageGenerateCard } from '../../../components/StageGenerateCard';
import { ApiError } from '../../../lib/apiClient';
import { ScreenMapViewer } from './ScreenMapViewer';
import { AppShell } from '../../../components/AppShell';
import { BackLink } from '../../../components/BackLink';
import { PageHeader } from '../../../components/PageHeader';
import { Alert } from '../../../components/Alert';
import { Skeleton } from '../../../components/Skeleton';
import { Button } from '../../../components/Button';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { Icon } from '../../../components/icons';
import { useToast } from '../../../components/Toast';
import { getNextStagePath } from '../projectStages';
import { StageInconsistencyAlert } from '../../../components/StageInconsistencyAlert';
import { usePrefillInstruction } from '../../../hooks/usePrefillInstruction';

// STCC-152 (US-030): pagina del mapa de pantallas — grafo de navegacion
// clickeable con wireframe en vivo y modo prototipo por pantalla, con el
// mismo ciclo DRAFT/APPROVED que el modelo de datos (el usuario revisa y
// aprueba el mapa antes de que otras etapas, como Pruebas, lo referencien).
export function ScreensPage() {
  usePageTitle('Mapa de pantallas');
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const prefillInstruction = usePrefillInstruction();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  const screenMapQueryKey = ['project', projectId, 'screens'];

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  const screenMapQuery = useQuery({
    queryKey: screenMapQueryKey,
    queryFn: () => getScreenMap(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  // Tambien invalida el chequeo de consistencia (StageInconsistencyAlert):
  // sin esto, el aviso de conflicto quedaba pegado con el mensaje viejo
  // aunque ya se haya resuelto, porque esa query tiene su propia key y
  // nada la refrescaba al generar/ajustar/aprobar en esta etapa.
  function invalidate() {
    queryClient.invalidateQueries({ queryKey: screenMapQueryKey });
    queryClient.invalidateQueries({ queryKey: ['project', projectId, 'consistency-check'] });
  }

  async function handleRefine(instruction: string) {
    await refineScreens(projectId as string, instruction, token as string);
    invalidate();
    showToast('Mapa de pantallas ajustado');
  }

  const generateMutation = useMutation({
    mutationFn: () => generateScreenMap(projectId as string, token as string),
    onSuccess: () => {
      setGenerateError(null);
      invalidate();
      showToast('Mapa de pantallas generado');
    },
    onError: (error: unknown) => {
      setGenerateError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => approveScreenMapVersion(projectId as string, token as string),
    onSuccess: () => {
      setApproveError(null);
      setShowApproveConfirm(false);
      invalidate();
      showToast('Mapa de pantallas aprobado');
      const nextPath = getNextStagePath(projectId as string, 'screens');
      if (nextPath) navigate(nextPath);
    },
    onError: (error: unknown) => {
      setApproveError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  if (projectQuery.isPending || screenMapQuery.isPending) {
    return (
      <AppShell>
        <Skeleton variant="text" className="w-48" />
        <Skeleton variant="block" />
      </AppShell>
    );
  }

  if (projectQuery.isError || !projectQuery.data || screenMapQuery.isError || !screenMapQuery.data) {
    return (
      <AppShell>
        <Alert
          onRetry={() => {
            projectQuery.refetch();
            screenMapQuery.refetch();
          }}
        >
          No se pudo cargar el mapa de pantallas
        </Alert>
        <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>
      </AppShell>
    );
  }

  const role = projectQuery.data.role;
  const canEdit = role === 'owner' || role === 'editor';
  const canApprove = role === 'owner';
  const { draft, approved } = screenMapQuery.data;
  const current = draft ?? approved;

  return (
    <AppShell breadcrumb={projectQuery.data.name}>
      <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>

      <PageHeader title="Mapa de pantallas" />

      <StageInconsistencyAlert projectId={projectId as string} ruleStage="screens" />

      <div className="flex flex-wrap items-center justify-between gap-space-md rounded-xl bg-surface-container px-gutter py-space-sm shadow-sm">
        <div className="flex flex-wrap items-center gap-space-sm">
          {approved && !draft && (
            <span className="flex items-center gap-1.5 rounded-full bg-tertiary-container/30 px-3 py-1 text-label-sm font-medium text-tertiary">
              <Icon name="verified" className="text-[16px]" filled />
              Aprobado v{approved.versionNumber} (sin cambios pendientes)
            </span>
          )}
          {draft && (
            <span className="flex items-center gap-1.5 rounded-full bg-warning-container/30 px-3 py-1 text-label-sm font-medium text-warning">
              <Icon name="edit_note" className="text-[16px]" />
              En edición v{draft.versionNumber} (DRAFT)
            </span>
          )}
          {!approved && !draft && (
            <span className="text-body-sm text-on-surface-variant">Todavía no se generó ningún mapa.</span>
          )}
          {current && (
            <span className="flex items-center gap-1.5 rounded bg-surface-container-high px-3 py-1 font-mono text-code-sm text-on-surface-variant">
              <Icon name="dashboard" className="text-[16px] text-secondary" />
              {current.screens.length} pantallas
            </span>
          )}
        </div>
        {canEdit && current && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => generateMutation.mutate()}
            loading={generateMutation.isPending}
          >
            <Icon name="auto_awesome" className="text-[16px]" />
            Generar nueva versión con IA
          </Button>
        )}
      </div>

      {!current && canEdit && (
        <StageGenerateCard
          title="el mapa de pantallas"
          description="Son las pantallas del producto y cómo se navega entre ellas, conectadas a los datos y endpoints que ya existen."
          inputs={['El modelo de datos y la API que aprobaste', 'El alcance del MVP y el recorrido principal']}
          outputs={['Las pantallas con sus elementos principales', 'El mapa de navegación entre ellas', 'La maqueta de cada pantalla, navegable']}
          ctaLabel="Generar mapa de pantallas"
          onGenerate={() => generateMutation.mutate()}
          isGenerating={generateMutation.isPending}
          error={generateError}
        />
      )}
      {current && generateError && <Alert>{generateError}</Alert>}

      {current && (
        <StageAssistant
          id="screens"
          placeholder='Ej: "Agregá filtros a la pantalla de tickets"'
          onSubmit={handleRefine}
          disabled={!canEdit}
          disabledReason="Solo el owner o un editor puede ajustar el mapa de pantallas."
          initialInstruction={prefillInstruction}
        />
      )}

      {current && (
        <>
          <section className="space-y-3">
            <ScreenMapViewer
              diagram={current.diagram}
              screens={current.screens}
              navigation={current.navigation}
            />
          </section>

          {canApprove && draft && (
            <section className="flex items-center justify-between gap-space-md rounded-xl bg-primary-container/10 p-space-lg">
              <div className="flex flex-col gap-1">
                {approveError && <Alert>{approveError}</Alert>}
                <p className="text-body-sm text-on-surface-variant">
                  Esta versión queda vigente para las etapas siguientes (Pruebas, documento final).
                </p>
              </div>
              <Button variant="secondary" onClick={() => setShowApproveConfirm(true)} className="shrink-0">
                <Icon name="arrow_forward" className="text-[16px]" />
                Aprobar y continuar
              </Button>
            </section>
          )}

          <ConfirmDialog
            open={showApproveConfirm}
            title="Aprobar mapa de pantallas"
            description={
              draft
                ? `¿Confirmás que esta version (v${draft.versionNumber}) queda como la version vigente? No vas a poder editarla libremente despues.`
                : ''
            }
            confirmLabel="Sí, aprobar"
            isConfirming={approveMutation.isPending}
            onConfirm={() => approveMutation.mutate()}
            onCancel={() => setShowApproveConfirm(false)}
          />
        </>
      )}
    </AppShell>
  );
}
