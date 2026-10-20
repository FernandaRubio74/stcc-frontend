import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getProject } from '../../../services/projectsService';
import { generateScreenMap, getScreenMap } from '../../../services/screensService';
import { ApiError } from '../../../lib/apiClient';
import { ScreenMapViewer } from './ScreenMapViewer';

// STCC-152 (US-030): pagina del mapa de pantallas — grafo de navegacion
// clickeable con mockup de baja fidelidad por pantalla, y el flujo de
// generar con IA a partir de la especificacion de API aprobada (US-027).
export function ScreensPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [generateError, setGenerateError] = useState<string | null>(null);

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

  const generateMutation = useMutation({
    mutationFn: () => generateScreenMap(projectId as string, token as string),
    onSuccess: () => {
      setGenerateError(null);
      queryClient.invalidateQueries({ queryKey: screenMapQueryKey });
    },
    onError: (error: unknown) => {
      setGenerateError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  if (projectQuery.isPending || screenMapQuery.isPending) {
    return <p className="p-8 text-sm text-gray-500">Cargando…</p>;
  }

  if (projectQuery.isError || !projectQuery.data || screenMapQuery.isError) {
    return (
      <div className="space-y-3 p-8">
        <p role="alert" className="text-sm text-red-700">
          No se pudo cargar el mapa de pantallas
        </p>
        <Link to={`/projects/${projectId}`} className="text-sm text-indigo-600 hover:underline">
          Volver al proyecto
        </Link>
      </div>
    );
  }

  const role = projectQuery.data.role;
  const canGenerate = role === 'owner' || role === 'editor';
  const screenMap = screenMapQuery.data;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link to={`/projects/${projectId}`} className="text-sm text-indigo-600 hover:underline">
          ← Volver al proyecto
        </Link>

        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Mapa de pantallas</h1>
        </header>

        {!screenMap && canGenerate && (
          <div className="space-y-2">
            {generateError && (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {generateError}
              </p>
            )}
            <button
              type="button"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generateMutation.isPending ? 'Generando…' : 'Generar con IA'}
            </button>
          </div>
        )}

        <section className="space-y-3">
          <ScreenMapViewer diagram={screenMap?.diagram ?? null} screens={screenMap?.screens ?? []} />
        </section>
      </div>
    </div>
  );
}
