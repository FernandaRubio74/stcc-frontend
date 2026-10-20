import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { getProject } from '../../../services/projectsService';
import {
  approveApiSpecVersion,
  generateApiSpec,
  getApiSpec,
  updateApiSpecEndpoints,
} from '../../../services/apiSpecService';
import { ApiError } from '../../../lib/apiClient';
import { ApiSpecViewer } from './ApiSpecViewer';
import type { Endpoint } from '../../../types/apiSpec';

// STCC-128 (US-025): pagina de la especificacion de API — listado tipo
// Swagger agrupado por entidad, edicion inline conectada a US-024, y el
// flujo de generar/guardar/aprobar version (mismo patron que DataModelPage).
export function ApiSpecPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();

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

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: apiSpecQueryKey });
  }

  const generateMutation = useMutation({
    mutationFn: () => generateApiSpec(projectId as string, token as string),
    onSuccess: () => {
      setGenerateError(null);
      invalidate();
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
    },
    onError: (error: unknown) => {
      setApproveError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  if (projectQuery.isPending || apiSpecQuery.isPending) {
    return <p className="p-8 text-sm text-gray-500">Cargando…</p>;
  }

  if (projectQuery.isError || !projectQuery.data || apiSpecQuery.isError || !apiSpecQuery.data) {
    return (
      <div className="space-y-3 p-8">
        <p role="alert" className="text-sm text-red-700">
          No se pudo cargar la especificacion de API
        </p>
        <Link to={`/projects/${projectId}`} className="text-sm text-indigo-600 hover:underline">
          Volver al proyecto
        </Link>
      </div>
    );
  }

  const role = projectQuery.data.role;
  const canEdit = role === 'owner' || role === 'editor';
  const canApprove = role === 'owner';
  const { draft, approved } = apiSpecQuery.data;
  const current = draft ?? approved;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link to={`/projects/${projectId}`} className="text-sm text-indigo-600 hover:underline">
          ← Volver al proyecto
        </Link>

        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Especificacion de API</h1>
        </header>

        <div className="rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-700">
          {approved && (
            <p>
              ✅ Version vigente aprobada: <strong>v{approved.versionNumber}</strong>
            </p>
          )}
          {draft ? (
            <p className="text-amber-700">
              ✏️ Hay cambios sin aprobar: <strong>v{draft.versionNumber} (DRAFT)</strong>
            </p>
          ) : (
            approved && <p className="text-gray-500">No hay cambios pendientes sobre la version aprobada.</p>
          )}
          {!approved && !draft && <p className="text-gray-500">Todavia no se genero ninguna especificacion.</p>}
        </div>

        {!current && canEdit && (
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

        {current && (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Endpoints</h2>
              <ApiSpecViewer endpoints={endpoints} onChange={setEndpoints} disabled={!canEdit} />

              {saveError && (
                <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {saveError}
                </p>
              )}

              {canEdit && (
                <button
                  type="button"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saveMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
                </button>
              )}
            </section>

            {canApprove && draft && (
              <section className="space-y-2 rounded-md border border-indigo-200 bg-indigo-50 p-4">
                {approveError && (
                  <p role="alert" className="text-sm text-red-700">
                    {approveError}
                  </p>
                )}
                {!showApproveConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowApproveConfirm(true)}
                    className="rounded-md border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
                  >
                    Aprobar versión
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-indigo-900">
                      ¿Confirmás que esta version (v{draft.versionNumber}) queda como la version vigente? No vas a
                      poder editarla libremente despues.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => approveMutation.mutate()}
                        disabled={approveMutation.isPending}
                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {approveMutation.isPending ? 'Aprobando…' : 'Sí, aprobar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowApproveConfirm(false)}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
