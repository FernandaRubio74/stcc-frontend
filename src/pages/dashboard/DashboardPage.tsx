import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { listProjects } from '../../services/projectsService';
import { ApiError } from '../../lib/apiClient';

// STCC-65: listado de proyectos donde el usuario es miembro.
export function DashboardPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const {
    data: projects,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjects(token as string),
    enabled: Boolean(token),
  });

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Mis proyectos</h1>
            <p className="text-sm text-gray-600">{user?.fullName}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/projects/new"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Nuevo proyecto
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {isPending && <p className="text-sm text-gray-500">Cargando proyectos…</p>}

        {isError && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error instanceof ApiError ? error.message : 'No se pudieron cargar los proyectos'}
          </p>
        )}

        {projects && projects.length === 0 && (
          <p className="text-sm text-gray-500">Todavía no participás en ningún proyecto.</p>
        )}

        {projects && projects.length > 0 && (
          <ul className="space-y-2">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  to={`/projects/${project.id}`}
                  className="block rounded-lg bg-white p-4 shadow transition hover:shadow-md"
                >
                  <p className="font-medium text-gray-900">{project.name}</p>
                  {project.description && (
                    <p className="text-sm text-gray-600">{project.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
