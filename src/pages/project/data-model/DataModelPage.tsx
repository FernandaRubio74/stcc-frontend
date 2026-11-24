import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { getProject } from '../../../services/projectsService';
import {
  approveDataModelVersion,
  generateDataModel,
  getDataModel,
  refineDataModel,
  updateDataModelEntities,
} from '../../../services/dataModelService';
import { StageAssistant } from '../../../components/StageAssistant';
import { StageGenerateCard } from '../../../components/StageGenerateCard';
import { ApiError } from '../../../lib/apiClient';
import { ErDiagram } from './ErDiagram';
import { EntityEditor } from './EntityEditor';
import type { Entity } from '../../../types/dataModel';
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

// STCC-113 (US-022): pagina del modelo de datos — diagrama ER, editor
// inline de entidades y el flujo de generar/guardar/aprobar version.
export function DataModelPage() {
  usePageTitle('Modelo de datos');
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const prefillInstruction = usePrefillInstruction();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [entities, setEntities] = useState<Entity[]>([]);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);
  const seededVersionId = useRef<string | null>(null);

  const dataModelQueryKey = ['project', projectId, 'data-model'];

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  const dataModelQuery = useQuery({
    queryKey: dataModelQueryKey,
    queryFn: () => getDataModel(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  // Solo re-sembramos el borrador local cuando cambia la version vigente
  // (draft o approved), no en cada refetch: asi no se pisan ediciones
  // locales todavia no guardadas.
  useEffect(() => {
    if (!dataModelQuery.data) return;
    const current = dataModelQuery.data.draft ?? dataModelQuery.data.approved;
    const currentId = current?.id ?? null;
    if (currentId !== seededVersionId.current) {
      setEntities(current?.entities ?? []);
      seededVersionId.current = currentId;
    }
  }, [dataModelQuery.data]);

  // Tambien invalida el chequeo de consistencia (StageInconsistencyAlert):
  // sin esto, el aviso de conflicto quedaba pegado con el mensaje viejo
  // aunque ya se haya resuelto, porque esa query tiene su propia key y
  // nada la refrescaba al generar/ajustar/guardar en esta etapa.
  function invalidate() {
    queryClient.invalidateQueries({ queryKey: dataModelQueryKey });
    queryClient.invalidateQueries({ queryKey: ['project', projectId, 'consistency-check'] });
  }

  // "Generar con IA" y "Ajustar con IA" actualizan el MISMO draft in place
  // (mismo id, no crean una version nueva) - el efecto de arriba solo
  // re-siembra `entities` cuando cambia el id, a proposito, para no pisar
  // una edicion manual sin guardar en cada refetch de fondo. Pero eso
  // significa que, sin esto, regenerar/ajustar con IA invalidaba la query
  // y el servidor SI tenia el contenido nuevo, pero el editor seguia
  // mostrando el viejo (mismo id = el efecto nunca se disparaba de nuevo) -
  // bug real reportado: "le doy a generar de nuevo y no cambia nada".
  // Por eso estos dos casos siembran `entities` DIRECTO del resultado,
  // ademas de invalidar (que sigue haciendo falta para versionNumber/status).
  async function handleRefine(instruction: string) {
    const draft = await refineDataModel(projectId as string, instruction, token as string);
    setEntities(draft.entities);
    seededVersionId.current = draft.id;
    invalidate();
    showToast('Modelo de datos ajustado');
  }

  const generateMutation = useMutation({
    mutationFn: () => generateDataModel(projectId as string, token as string),
    onSuccess: (draft) => {
      setGenerateError(null);
      setEntities(draft.entities);
      seededVersionId.current = draft.id;
      invalidate();
      showToast('Modelo de datos generado');
    },
    onError: (error: unknown) => {
      setGenerateError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => updateDataModelEntities(projectId as string, entities, token as string),
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
    mutationFn: () => approveDataModelVersion(projectId as string, token as string),
    onSuccess: () => {
      setApproveError(null);
      setShowApproveConfirm(false);
      invalidate();
      showToast('Versión aprobada');
      const nextPath = getNextStagePath(projectId as string, 'data-model');
      if (nextPath) navigate(nextPath);
    },
    onError: (error: unknown) => {
      setApproveError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  if (projectQuery.isPending || dataModelQuery.isPending) {
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
    dataModelQuery.isError ||
    !dataModelQuery.data
  ) {
    return (
      <AppShell>
        <Alert
          onRetry={() => {
            projectQuery.refetch();
            dataModelQuery.refetch();
          }}
        >
          No se pudo cargar el modelo de datos
        </Alert>
        <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>
      </AppShell>
    );
  }

  const role = projectQuery.data.role;
  const canEdit = role === 'owner' || role === 'editor';
  const canApprove = role === 'owner';
  const { draft, approved } = dataModelQuery.data;
  const current = draft ?? approved;
  const relationCount = entities.reduce(
    (count, entity) => count + entity.attributes.filter((a) => a.foreignKey).length,
    0,
  );

  return (
    <AppShell breadcrumb={projectQuery.data.name}>
      <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>

      <PageHeader title="Modelo de datos" />

      <StageInconsistencyAlert projectId={projectId as string} ruleStage="data-model" />

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
              En edición v{draft.versionNumber} (DRAFT)
            </span>
          )}
          {!approved && !draft && (
            <span className="text-body-sm text-on-surface-variant">Todavía no se generó ningún modelo.</span>
          )}
          {current && (
            <span className="flex items-center gap-1.5 rounded bg-surface-container-high px-3 py-1 font-mono text-code-sm text-on-surface-variant">
              <Icon name="database" className="text-[16px] text-secondary" />
              {entities.length} entidades
              <span className="text-outline">|</span>
              <span className="text-tertiary">{relationCount} relaciones FK</span>
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
          title="el modelo de datos"
          description="Es la estructura de la información que va a guardar tu producto: qué entidades existen, qué atributos tiene cada una y cómo se relacionan entre sí."
          inputs={['El problema y el contexto que contaste', 'Los usuarios objetivo y el alcance del MVP']}
          outputs={['Las entidades con sus atributos y claves', 'El diagrama entidad-relación', 'Datos de ejemplo coherentes']}
          ctaLabel="Generar modelo de datos"
          onGenerate={() => generateMutation.mutate()}
          isGenerating={generateMutation.isPending}
          error={generateError}
        />
      )}

      {current && generateError && <Alert>{generateError}</Alert>}

      {current && (
        <StageAssistant
          id="data-model"
          placeholder='Ej: "Agregá una entidad Proveedor con nombre, email y teléfono"'
          onSubmit={handleRefine}
          disabled={!canEdit}
          disabledReason="Solo el owner o un editor puede ajustar el modelo de datos."
          initialInstruction={prefillInstruction}
        />
      )}

      {current && (
        <>
          <section className="flex flex-col gap-space-sm">
            <h2 className="flex items-center gap-space-xs text-headline-sm font-semibold text-on-surface">
              <Icon name="account_tree" className="text-secondary" />
              Visualizador ERD relacional
            </h2>
            <ErDiagram diagram={current.diagram} />
          </section>

          <section className="flex flex-col gap-space-md">
            <h2 className="text-headline-sm font-semibold text-on-surface">Entidades</h2>
            <EntityEditor entities={entities} onChange={setEntities} disabled={!canEdit} />

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
