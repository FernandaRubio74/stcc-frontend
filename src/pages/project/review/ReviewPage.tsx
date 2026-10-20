import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { getReviewSummary, postFinalGeneration } from '../../../services/reviewService';
import { ApiError } from '../../../lib/apiClient';
import { ReviewChecklist } from './ReviewChecklist';
import type { StageKey } from '../../../types/review';

const STAGE_ROUTES: Record<StageKey, string> = {
  definition: 'wizard',
  dataModel: 'data-model',
  apiSpec: 'api-spec',
  screens: 'screens',
  architecture: 'architecture',
};

// STCC-166 (US-033): pantalla de revision final — checklist por etapa con
// estado visual, navegacion directa a conflictos, y el boton de generacion
// final deshabilitado mientras el proyecto no este listo (US-031/US-032).
export function ReviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);

  const reviewQueryKey = ['project', projectId, 'review-summary'];

  const reviewQuery = useQuery({
    queryKey: reviewQueryKey,
    queryFn: () => getReviewSummary(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  const generateMutation = useMutation({
    mutationFn: () => postFinalGeneration(projectId as string, token as string),
    onSuccess: (result) => {
      setGenerateError(null);
      setGenerateSuccess(result.message);
    },
    onError: (error: unknown) => {
      setGenerateSuccess(null);
      setGenerateError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
      queryClient.invalidateQueries({ queryKey: reviewQueryKey });
    },
  });

  function handleNavigateToStage(stage: StageKey) {
    navigate(`/projects/${projectId}/${STAGE_ROUTES[stage]}`);
  }

  if (reviewQuery.isPending) {
    return <p className="p-8 text-sm text-gray-500">Cargando…</p>;
  }

  if (reviewQuery.isError || !reviewQuery.data) {
    return (
      <div className="space-y-3 p-8">
        <p role="alert" className="text-sm text-red-700">
          No se pudo cargar la revision del proyecto
        </p>
        <Link to={`/projects/${projectId}`} className="text-sm text-indigo-600 hover:underline">
          Volver al proyecto
        </Link>
      </div>
    );
  }

  const { stages, blockingQuestions, inconsistencies, readyToGenerate } = reviewQuery.data;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link to={`/projects/${projectId}`} className="text-sm text-indigo-600 hover:underline">
          ← Volver al proyecto
        </Link>

        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Revisión final</h1>
        </header>

        {generateError && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {generateError}
          </p>
        )}
        {generateSuccess && (
          <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {generateSuccess}
          </p>
        )}

        <ReviewChecklist
          stages={stages}
          inconsistencies={inconsistencies}
          blockingQuestions={blockingQuestions}
          onNavigateToStage={handleNavigateToStage}
          readyToGenerate={readyToGenerate}
          onGenerateClick={() => generateMutation.mutate()}
          isGenerating={generateMutation.isPending}
        />
      </div>
    </div>
  );
}
