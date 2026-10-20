import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getProject } from '../../../services/projectsService';
import {
  getArchitecture,
  getArchitectureCatalog,
  recommendArchitecture,
  selectArchitecture,
} from '../../../services/architectureService';
import { ApiError } from '../../../lib/apiClient';
import { ArchitectureSelector } from './ArchitectureSelector';

// STCC-152 (US-030): pagina de seleccion de arquitectura — vista
// comparativa de las 5 opciones del catalogo (US-028/US-029), con la
// recomendacion de la IA resaltada y el flujo de aceptarla o elegir otra.
export function ArchitecturePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();
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

  const recommendMutation = useMutation({
    mutationFn: () => recommendArchitecture(projectId as string, token as string),
    onSuccess: () => {
      setRecommendError(null);
      invalidate();
    },
    onError: (error: unknown) => {
      setRecommendError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  const selectMutation = useMutation({
    mutationFn: (architectureId: string) => selectArchitecture(projectId as string, architectureId, token as string),
    onSuccess: () => {
      setSelectError(null);
      invalidate();
    },
    onError: (error: unknown) => {
      setSelectError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  if (projectQuery.isPending || catalogQuery.isPending || architectureQuery.isPending) {
    return <p className="p-8 text-sm text-gray-500">Cargando…</p>;
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
      <div className="space-y-3 p-8">
        <p role="alert" className="text-sm text-red-700">
          No se pudo cargar la seleccion de arquitectura
        </p>
        <Link to={`/projects/${projectId}`} className="text-sm text-indigo-600 hover:underline">
          Volver al proyecto
        </Link>
      </div>
    );
  }

  const role = projectQuery.data.role;
  const canRecommend = role === 'owner' || role === 'editor';
  const canSelect = role === 'owner';
  const state = architectureQuery.data;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link to={`/projects/${projectId}`} className="text-sm text-indigo-600 hover:underline">
          ← Volver al proyecto
        </Link>

        <header className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Arquitectura tecnológica</h1>
          {canRecommend && (
            <button
              type="button"
              onClick={() => recommendMutation.mutate()}
              disabled={recommendMutation.isPending}
              className="shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {recommendMutation.isPending
                ? 'Recomendando…'
                : state.recommendedId
                  ? 'Volver a recomendar'
                  : 'Recomendar con IA'}
            </button>
          )}
        </header>

        {recommendError && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {recommendError}
          </p>
        )}
        {selectError && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {selectError}
          </p>
        )}

        {state.selectedId && (
          <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            ✅ Arquitectura confirmada: <strong>{state.selectedId}</strong>
          </p>
        )}

        <ArchitectureSelector
          catalog={catalogQuery.data}
          state={state}
          canSelect={canSelect}
          onSelect={(architectureId) => selectMutation.mutate(architectureId)}
          isSelecting={selectMutation.isPending}
        />
      </div>
    </div>
  );
}
