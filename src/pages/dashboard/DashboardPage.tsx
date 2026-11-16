import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { listProjects } from '../../services/projectsService';
import { ApiError } from '../../lib/apiClient';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { EmptyState } from '../../components/EmptyState';
import { Spinner } from '../../components/Spinner';

// STCC-65: listado de proyectos donde el usuario es miembro.
export function DashboardPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const {
    data: projects,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjects(token as string),
    enabled: Boolean(token),
  });

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          title="Mis proyectos"
          subtitle={user?.fullName}
          actions={
            <>
              <Link to="/projects/new">
                <Button>Nuevo proyecto</Button>
              </Link>
              <Button variant="secondary" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </>
          }
        />

        {isPending && <Spinner label="Cargando proyectos…" />}

        {isError && (
          <Alert onRetry={() => refetch()}>
            {error instanceof ApiError ? error.message : 'No se pudieron cargar los proyectos'}
          </Alert>
        )}

        {projects && projects.length === 0 && (
          <EmptyState
            title="Todavía no participás en ningún proyecto"
            description="Creá uno nuevo para empezar a definirlo con Ideator."
            action={
              <Link to="/projects/new">
                <Button>Crear mi primer proyecto</Button>
              </Link>
            }
          />
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
