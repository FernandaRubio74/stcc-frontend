import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { getProject } from '../../../services/projectsService';
import { approveTestPlanVersion, generateTestPlan, getTestPlan, refineTestPlan } from '../../../services/testingService';
import { StageAssistant } from '../../../components/StageAssistant';
import { StageGenerateCard } from '../../../components/StageGenerateCard';
import { ApiError } from '../../../lib/apiClient';
import { TestPlanViewer } from './TestPlanViewer';
import { AppShell } from '../../../components/AppShell';
import { BackLink } from '../../../components/BackLink';
import { PageHeader } from '../../../components/PageHeader';
import { Alert } from '../../../components/Alert';
import { Skeleton } from '../../../components/Skeleton';
import { Button } from '../../../components/Button';
import { EmptyState } from '../../../components/EmptyState';
import { Icon } from '../../../components/icons';
import { useToast } from '../../../components/Toast';
import { getNextStagePath } from '../projectStages';

// Etapa "Pruebas" (entre Arquitectura y Revision final): plan de pruebas
// derivado por IA de todo lo ya aprobado, con la misma validacion de
// cobertura que el backend (no se puede avanzar con un requisito, endpoint
// o pantalla real sin casos de prueba - ver testing/coverage.js).
export function TestingPage() {
  usePageTitle('Pruebas');
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);

  const testPlanQueryKey = ['project', projectId, 'testing'];

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  const testPlanQuery = useQuery({
    queryKey: testPlanQueryKey,
    queryFn: () => getTestPlan(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: testPlanQueryKey });
  }

  async function handleRefine(instruction: string) {
    await refineTestPlan(projectId as string, instruction, token as string);
    invalidate();
    showToast('Plan de pruebas ajustado');
  }

  const generateMutation = useMutation({
    mutationFn: () => generateTestPlan(projectId as string, token as string),
    onSuccess: () => {
      setGenerateError(null);
      invalidate();
      showToast('Plan de pruebas generado');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.gaps) {
        const detalle = [
          error.gaps.missingRequirements.length > 0 && `requisitos: ${error.gaps.missingRequirements.join(', ')}`,
          error.gaps.missingEndpoints.length > 0 && `endpoints: ${error.gaps.missingEndpoints.join(', ')}`,
          error.gaps.missingScreens.length > 0 && `pantallas: ${error.gaps.missingScreens.join(', ')}`,
        ]
          .filter(Boolean)
          .join(' · ');
        setGenerateError(`${error.message}${detalle ? ` (${detalle})` : ''}`);
        return;
      }
      setGenerateError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => approveTestPlanVersion(projectId as string, token as string),
    onSuccess: () => {
      setApproveError(null);
      invalidate();
      showToast('Plan de pruebas aprobado');
      const nextPath = getNextStagePath(projectId as string, 'testing');
      if (nextPath) navigate(nextPath);
    },
    onError: (error: unknown) => {
      setApproveError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  if (projectQuery.isPending || testPlanQuery.isPending) {
    return (
      <AppShell>
        <Skeleton variant="text" className="w-48" />
        <Skeleton variant="block" />
      </AppShell>
    );
  }

  if (projectQuery.isError || !projectQuery.data || testPlanQuery.isError || !testPlanQuery.data) {
    return (
      <AppShell>
        <Alert
          onRetry={() => {
            projectQuery.refetch();
            testPlanQuery.refetch();
          }}
        >
          No se pudo cargar el plan de pruebas
        </Alert>
        <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>
      </AppShell>
    );
  }

  const role = projectQuery.data.role;
  const canGenerate = role === 'owner' || role === 'editor';
  const canApprove = role === 'owner';
  const { draft, approved } = testPlanQuery.data;
  const current = draft ?? approved;

  return (
    <AppShell breadcrumb={projectQuery.data.name}>
      <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>

      <PageHeader title="Pruebas" subtitle="Plan de pruebas derivado de todo lo ya aprobado en el proyecto." />

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
            <span className="text-body-sm text-on-surface-variant">Todavía no se generó el plan de pruebas.</span>
          )}
        </div>
        {canGenerate && current && (
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

      {generateError && <Alert>{generateError}</Alert>}

      {/* El plan se guarda aunque queden huecos (antes la generacion se
          descartaba entera y no habia forma de avanzar): aca se dice que
          falta y que se puede completar con el chat o a mano. Aprobar si
          exige cobertura completa. */}
      {draft?.coverageGaps && (
        <Alert tone="warning">
          <h3 className="font-semibold">Falta cubrir esto antes de aprobar</h3>
          <ul className="mt-1 list-inside list-disc space-y-1">
            {draft.coverageGaps.missingRequirements.length > 0 && (
              <li>Requisitos del MVP: {draft.coverageGaps.missingRequirements.join(', ')}</li>
            )}
            {draft.coverageGaps.missingEndpoints.length > 0 && (
              <li>Endpoints: {draft.coverageGaps.missingEndpoints.join(', ')}</li>
            )}
            {draft.coverageGaps.missingScreens.length > 0 && (
              <li>Pantallas: {draft.coverageGaps.missingScreens.join(', ')}</li>
            )}
          </ul>
          <p className="mt-2 text-label-sm text-on-surface-variant">
            El plan quedó guardado igual. Pedile al chat de abajo que agregue los casos que faltan.
          </p>
        </Alert>
      )}

      {!current && canGenerate && (
        <StageGenerateCard
          title="el plan de pruebas"
          description="Son los casos que hay que probar para dar el producto por terminado, derivados de todo lo que ya aprobaste."
          inputs={['Las reglas de negocio y el alcance del MVP', 'Los endpoints, las pantallas y la arquitectura']}
          outputs={['Casos de aceptación en formato Dado/Cuando/Entonces', 'Casos por endpoint y por pantalla', 'Casos de seguridad y matriz de trazabilidad']}
          ctaLabel="Generar plan de pruebas"
          onGenerate={() => generateMutation.mutate()}
          isGenerating={generateMutation.isPending}
          error={generateError}
        />
      )}

      {!current && !canGenerate && (
        <EmptyState title="Todavía no hay plan de pruebas" description="El owner o un editor puede generarlo." />
      )}

      {current && (
        <StageAssistant
          id="testing"
          placeholder='Ej: "Agregá un caso de seguridad para accesos por token vencido"'
          onSubmit={handleRefine}
          disabled={!canGenerate}
          disabledReason="Solo el owner o un editor puede ajustar el plan de pruebas."
        />
      )}

      {current && (
        <>
          <TestPlanViewer content={current.content} />

          {approveError && <Alert>{approveError}</Alert>}

          {canApprove && draft && (
            <div className="flex items-center justify-between gap-space-md rounded-xl bg-primary-container/10 p-space-lg">
              <p className="text-body-sm text-on-surface-variant">
                Esta versión queda vigente y deja de poder editarse libremente.
              </p>
              <Button onClick={() => approveMutation.mutate()} loading={approveMutation.isPending} className="shrink-0">
                <Icon name="arrow_forward" className="text-[16px]" />
                Aprobar y continuar
              </Button>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
