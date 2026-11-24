import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { getReviewSummary, postFinalGeneration } from '../../../services/reviewService';
import { generateArchitectureDocument, generateSpecDocument } from '../../../services/documentsService';
import { ApiError } from '../../../lib/apiClient';
import { ReviewChecklist } from './ReviewChecklist';
import { buildCombinedConflictInstruction, buildConflictInstruction } from './conflictInstructions';
import type { Inconsistency, StageKey } from '../../../types/review';
import { AppShell } from '../../../components/AppShell';
import { BackLink } from '../../../components/BackLink';
import { PageHeader } from '../../../components/PageHeader';
import { Alert } from '../../../components/Alert';
import { Skeleton } from '../../../components/Skeleton';
import { useToast } from '../../../components/Toast';

const STAGE_ROUTES: Record<StageKey, string> = {
  definition: 'wizard',
  dataModel: 'data-model',
  apiSpec: 'api-spec',
  screens: 'screens',
  architecture: 'architecture',
  testing: 'testing',
};

// STCC-166 (US-033): pantalla de revision final — checklist por etapa con
// estado visual, navegacion directa a conflictos, y el boton de generacion
// final deshabilitado mientras el proyecto no este listo (US-031/US-032).
export function ReviewPage() {
  usePageTitle('Revisión final');
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [generateError, setGenerateError] = useState<string | null>(null);

  const reviewQueryKey = ['project', projectId, 'review-summary'];

  const reviewQuery = useQuery({
    queryKey: reviewQueryKey,
    queryFn: () => getReviewSummary(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  // El boton decia "Generar documentacion final" pero solo llamaba al
  // chequeo previo de consistencia, que no genera nada: mostraba un toast
  // de "se puede proceder" y ahi terminaba, sin documentos y sin llevar a
  // ninguna parte. Ahora hace lo que dice: valida, genera los dos
  // documentos (especificacion y arquitectura, ambos deterministicos, sin
  // IA) y lleva a la pantalla de Documentos finales.
  const generateMutation = useMutation({
    mutationFn: async () => {
      await postFinalGeneration(projectId as string, token as string);
      await Promise.all([
        generateSpecDocument(projectId as string, token as string),
        generateArchitectureDocument(projectId as string, token as string),
      ]);
    },
    onSuccess: () => {
      setGenerateError(null);
      showToast('Documentación final generada');
      navigate(`/projects/${projectId}/documents`);
    },
    onError: (error: unknown) => {
      setGenerateError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
      queryClient.invalidateQueries({ queryKey: reviewQueryKey });
    },
  });

  function handleNavigateToStage(stage: StageKey) {
    navigate(`/projects/${projectId}/${STAGE_ROUTES[stage]}`);
  }

  // Pedido explicito: ademas de llevarte a la etapa con el conflicto, la
  // etapa destino abre con el chat "Ajustar con IA" (o, si es la etapa de
  // Definicion, el chat del wizard) ya cargado con la instruccion para
  // resolverlo - no hace falta redactarla de cero.
  function handleNavigateToConflict(stage: StageKey, issue: Inconsistency, ruleStage: string) {
    navigate(`/projects/${projectId}/${STAGE_ROUTES[stage]}`, {
      state: { prefillInstruction: buildConflictInstruction(issue, ruleStage) },
    });
  }

  // Boton "Resolver" de la etapa (en el checklist, al lado del badge de
  // conflicto): combina TODOS los conflictos de esa etapa en una sola
  // instruccion, en vez de que la persona tenga que ir conflicto por
  // conflicto desde la lista de abajo.
  function handleResolveStage(stage: StageKey, issues: { issue: Inconsistency; ruleStage: string }[]) {
    if (issues.length === 0) return;
    const ruleStage = issues[0].ruleStage;
    navigate(`/projects/${projectId}/${STAGE_ROUTES[stage]}`, {
      state: { prefillInstruction: buildCombinedConflictInstruction(issues.map((i) => i.issue), ruleStage) },
    });
  }

  if (reviewQuery.isPending) {
    return (
      <AppShell>
        <Skeleton variant="text" className="w-48" />
        <Skeleton variant="block" />
      </AppShell>
    );
  }

  if (reviewQuery.isError || !reviewQuery.data) {
    return (
      <AppShell>
        <Alert onRetry={() => reviewQuery.refetch()}>
          No se pudo cargar la revision del proyecto
        </Alert>
        <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>
      </AppShell>
    );
  }

  const { stages, blockingQuestions, inconsistencies, readyToGenerate } = reviewQuery.data;

  return (
    <AppShell>
      <BackLink to={`/projects/${projectId}`}>Volver al proyecto</BackLink>

      <PageHeader title="Revisión final" />

      {generateError && <Alert>{generateError}</Alert>}

      <ReviewChecklist
        stages={stages}
        inconsistencies={inconsistencies}
        blockingQuestions={blockingQuestions}
        onNavigateToStage={handleNavigateToStage}
        onNavigateToConflict={handleNavigateToConflict}
        onResolveStage={handleResolveStage}
        readyToGenerate={readyToGenerate}
        onGenerateClick={() => generateMutation.mutate()}
        isGenerating={generateMutation.isPending}
      />
    </AppShell>
  );
}
