import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { getProject } from '../../../services/projectsService';
import {
  approveApiSpecVersion,
  generateApiSpec,
  getApiSpec,
  refineApiSpec,
  updateApiSpecEndpoints,
} from '../../../services/apiSpecService';
import { StageAssistant } from '../../../components/StageAssistant';
import { StageGenerateCard } from '../../../components/StageGenerateCard';
import { ApiError } from '../../../lib/apiClient';
import { ApiSpecViewer } from './ApiSpecViewer';
import type { Endpoint } from '../../../types/apiSpec';
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

// STCC-128 (US-025): pagina de la especificacion de API — listado tipo
// Swagger agrupado por entidad, edicion inline conectada a US-024, y el
// flujo de generar/guardar/aprobar version (mismo patron que DataModelPage).
export function ApiSpecPage() {
  usePageTitle('Especificación de API');
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const prefillInstruction = usePrefillInstruction();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);
  const seededVersionId = useRef<string | null>(null);

  const apiSpecQueryKey = ['project', projectId, 'api-spec'];

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  const apiSpecQuery = useQuery({
    queryKey: apiSpecQueryKey,
    queryFn: () => getApiSpec(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  // Mismo patron que DataModelPage: solo re-sembramos el estado local
  // cuando cambia la version vigente, no en cada refetch, para no pisar
  // ediciones locales todavia no guardadas.
  useEffect(() => {
    if (!apiSpecQuery.data) return;
    const current = apiSpecQuery.data.draft ?? apiSpecQuery.data.approved;
    const currentId = current?.id ?? null;
    if (currentId !== seededVersionId.current) {
      setEndpoints(current?.endpoints ?? []);
      seededVersionId.current = currentId;
    }
  }, [apiSpecQuery.data]);

  // Tambien invalida el chequeo de consistencia (StageInconsistencyAlert):
  // sin esto, el aviso de conflicto quedaba pegado con el mensaje viejo
  // aunque ya se haya resuelto, porque esa query tiene su propia key y
  // nada la refrescaba al generar/ajustar/guardar en esta etapa.
  function invalidate() {
    queryClient.invalidateQueries({ queryKey: apiSpecQueryKey });
    queryClient.invalidateQueries({ queryKey: ['project', projectId, 'consistency-check'] });
  }

  // "Generar con IA" y "Ajustar con IA" actualizan el MISMO draft in place
  // (mismo id) - el efecto de arriba solo re-siembra `endpoints` cuando
  // cambia el id, a proposito, para no pisar una edicion manual sin
  // guardar en cada refetch de fondo. Pero eso significa que, sin esto,
  // regenerar/ajustar con IA invalidaba la query y el servidor SI tenia el
  // contenido nuevo, pero el editor seguia mostrando el viejo (mismo id =
  // el efecto nunca se disparaba de nuevo) - bug real reportado: "le doy a
  // generar de nuevo y no cambia nada". Por eso estos dos casos siembran
  // `endpoints` DIRECTO del resultado, ademas de invalidar (que sigue
  // haciendo falta para versionNumber/status).
  async function handleRefine(instruction: string) {
    const draft = await refineApiSpec(projectId as string, instruction, token as string);
    setEndpoints(draft.endpoints);
    seededVersionId.current = draft.id;
    invalidate();
    showToast('Especificación de API ajustada');
  }

  const generateMutation = useMutation({
    mutationFn: () => generateApiSpec(projectId as string, token as string),
    onSuccess: (draft) => {
      setGenerateError(null);
      setEndpoints(draft.endpoints);
      seededVersionId.current = draft.id;
      invalidate();
      showToast('Especificación de API generada');
    },
    onError: (error: unknown) => {
      setGenerateError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => updateApiSpecEndpoints(projectId as string, endpoints, token as string),
    onSuccess: () => {
      setSaveError(null);
      invalidate();
      showToast('Cambios guardados');
    },
    onError: (error: unknown) => {
      setSaveError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => approveApiSpecVersion(projectId as string, token as string),
    onSuccess: () => {
      setApproveError(null);
      setShowApproveConfirm(false);
      invalidate();
      showToast('Versión aprobada');
      const nextPath = getNextStagePath(projectId as string, 'api-spec');
      if (nextPath) navigate(nextPath);
    },
    onError: (error: unknown) => {
      setApproveError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  if (projectQuery.isPending || apiSpecQuery.isPending) {
    return (
      <AppShell>
        <Skeleton variant="text" className="w-48" />
        <Skeleton variant="block" />
      </AppShell>
    );
  }

  if (projectQuery.isError || !projectQuery.data || apiSpecQuery.isError || !apiSpecQuery.data) {
    return (
      <AppShell>
        <Alert
          onRetry={() => {
            projectQuery.refetch();
            apiSpecQuery.refetch();
          }}
        >
          No se pudo cargar la especificacion de API
        </Alert>
        <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>
      </AppShell>
    );
  }

  const role = projectQuery.data.role;
  const canEdit = role === 'owner' || role === 'editor';
  const canApprove = role === 'owner';
  const { draft, approved } = apiSpecQuery.data;
  const current = draft ?? approved;

  return (
    <AppShell breadcrumb={projectQuery.data.name}>
      <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>

      <PageHeader title="Especificación de API" />

      <StageInconsistencyAlert projectId={projectId as string} ruleStage="api-spec" />

      <div className="flex flex-wrap items-center justify-between gap-space-md rounded-xl bg-surface-container px-gutter py-space-sm shadow-sm">
        <div className="flex flex-wrap items-center gap-space-sm">
          {approved && !draft && (
            <span className="flex items-center gap-1.5 rounded-full bg-tertiary-container/30 px-3 py-1 text-label-sm font-medium text-tertiary">
              <Icon name="verified" className="text-[16px]" filled />
              Aprobada v{approved.versionNumber} (sin cambios pendientes)
            </span>
          )}
          {draft && (
            <span className="flex items-center gap-1.5 rounded-full bg-warning-container/30 px-3 py-1 text-label-sm font-medium text-warning">
              <Icon name="edit_note" className="text-[16px]" />
              Cambios sin aprobar v{draft.versionNumber} (DRAFT)
            </span>
          )}
          {!approved && !draft && (
            <span className="text-body-sm text-on-surface-variant">Todavía no se generó ninguna especificación.</span>
          )}
          {current && (
            <span className="flex items-center gap-1.5 rounded bg-surface-container-high px-3 py-1 font-mono text-code-sm text-on-surface-variant">
              <Icon name="data_object" className="text-[16px] text-primary" />
              {current.endpoints.length} endpoints
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
          title="la especificación de API"
          description="Son los endpoints que va a necesitar el producto para funcionar: qué operaciones existen sobre cada entidad, qué datos reciben y qué responden."
          inputs={['El modelo de datos que aprobaste', 'El alcance del MVP']}
          outputs={['Los endpoints con método, ruta y parámetros', 'Los códigos de respuesta, incluidos los de error', 'La separación entre autenticación (401) y permisos (403)']}
          ctaLabel="Generar especificación de API"
          onGenerate={() => generateMutation.mutate()}
          isGenerating={generateMutation.isPending}
          error={generateError}
        />
      )}
      {current && generateError && <Alert>{generateError}</Alert>}

      {current && (
        <StageAssistant
          id="api-spec"
          placeholder='Ej: "Agregá un endpoint para borrar un usuario"'
          onSubmit={handleRefine}
          disabled={!canEdit}
          disabledReason="Solo el owner o un editor puede ajustar la especificación de API."
          initialInstruction={prefillInstruction}
        />
      )}

      {current && (
        <>
          <section className="flex flex-col gap-space-md">
            <h2 className="flex items-center gap-space-xs text-headline-sm font-semibold text-on-surface">
              <Icon name="data_object" className="text-primary" />
              Endpoints
            </h2>
            <ApiSpecViewer endpoints={endpoints} onChange={setEndpoints} disabled={!canEdit} />

            {saveError && <Alert>{saveError}</Alert>}

            {canEdit && (
              <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending} className="self-start">
                Guardar cambios
              </Button>
            )}
          </section>

          {canApprove && draft && (
            <section className="flex items-center justify-between gap-space-md rounded-xl bg-primary-container/10 p-space-lg">
              <div className="flex flex-col gap-1">
                {approveError && <Alert>{approveError}</Alert>}
                <p className="text-body-sm text-on-surface-variant">
                  Esta versión queda vigente y deja de poder editarse libremente.
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
            title="Aprobar versión"
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
