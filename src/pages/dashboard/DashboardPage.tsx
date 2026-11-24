import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { usePageTitle } from '../../hooks/usePageTitle';
import { listProjects, createProject } from '../../services/projectsService';
import { ApiError } from '../../lib/apiClient';
import type { ProjectListItem } from '../../types/project';
import { AppShell } from '../../components/AppShell';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { Modal } from '../../components/Modal';
import { Icon } from '../../components/icons';
import { NewProjectForm, type NewProjectFormValues } from './NewProjectForm';
import { useToast } from '../../components/Toast';

// US-065: antes la tarjeta no tenia ninguna nocion de "hace cuanto" se tocó
// el proyecto por ultima vez - se formatea a mano para no sumar una
// dependencia (date-fns/dayjs) solo por esto.
function relativeUpdatedAt(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Hoy';
  if (diffDays === 1) return 'Hace 1 día';
  if (diffDays < 30) return `Hace ${diffDays} días`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return 'Hace 1 mes';
  return `Hace ${diffMonths} meses`;
}

function slugOf(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

type ProjectStatus = 'draft' | 'in-progress' | 'done';

function statusOf(project: ProjectListItem): ProjectStatus {
  const { completedStages, totalStages } = project.progress;
  if (completedStages >= totalStages && totalStages > 0) return 'done';
  if (completedStages === 0) return 'draft';
  return 'in-progress';
}

const STATUS_PILL: Record<ProjectStatus, { label: string; dot: string; classes: string }> = {
  done: { label: 'Documentos listos', dot: 'bg-tertiary', classes: 'bg-tertiary-container/30 text-tertiary' },
  'in-progress': {
    label: 'En progreso',
    dot: 'bg-secondary',
    classes: 'bg-secondary-container/20 text-secondary',
  },
  draft: { label: 'Borrador inicial', dot: 'bg-outline', classes: 'bg-surface-variant text-outline' },
};

const STATUS_ACTION: Record<ProjectStatus, { label: string; icon: string }> = {
  done: { label: 'Ver documentos', icon: 'folder_open' },
  'in-progress': { label: 'Continuar', icon: 'arrow_forward' },
  draft: { label: 'Iniciar spec', icon: 'play_arrow' },
};

function ProjectCard({ project }: { project: ProjectListItem }) {
  const { completedStages, totalStages } = project.progress;
  const percent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
  const status = statusOf(project);
  const pill = STATUS_PILL[status];
  const action = STATUS_ACTION[status];

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group relative flex flex-col justify-between gap-space-lg overflow-hidden rounded-xl bg-surface-container-low p-space-lg shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate rounded bg-surface-container px-2 py-0.5 font-mono text-code-sm font-semibold text-on-surface">
            {slugOf(project.name)}
          </span>
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-label-sm font-semibold ${pill.classes}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} />
            {pill.label}
          </span>
        </div>
        <div className="mt-1">
          <h3 className="text-headline-sm font-semibold text-on-surface transition-colors group-hover:text-primary">
            {project.name}
          </h3>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-body-sm text-on-surface-variant">{project.description}</p>
          )}
        </div>
        <div className="mt-2 flex flex-col gap-1.5 rounded-lg bg-surface-container p-2.5">
          <div className="flex items-center justify-between text-label-sm text-on-surface">
            <span className={`flex items-center gap-1 font-semibold ${status === 'done' ? 'text-tertiary' : status === 'in-progress' ? 'text-secondary' : 'text-outline'}`}>
              {status === 'done' && <Icon name="verified" className="text-[14px]" />}
              {completedStages}/{totalStages} etapas completadas
            </span>
            <span className="font-mono text-code-sm text-on-surface">{percent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-variant/40">
            <div
              className={`h-full rounded-full ${status === 'done' ? 'bg-tertiary' : status === 'in-progress' ? 'bg-secondary' : 'bg-outline/30'}`}
              style={{ width: `${Math.max(percent, 4)}%` }}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-space-sm">
        <span className="font-mono text-[11px] text-outline">{relativeUpdatedAt(project.updatedAt)}</span>
        <span
          className={`flex items-center gap-1 text-label-md font-semibold ${status === 'done' ? 'text-tertiary' : status === 'in-progress' ? 'text-secondary' : 'text-on-surface-variant'} transition-colors group-hover:text-primary`}
        >
          {action.label}
          <Icon name={action.icon} className="text-[16px]" />
        </span>
      </div>
    </Link>
  );
}

// STCC-65: listado de proyectos donde el usuario es miembro.
export function DashboardPage() {
  usePageTitle('Mis proyectos');
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  const createMutation = useMutation({
    mutationFn: (values: NewProjectFormValues) => createProject(values, token as string),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setModalOpen(false);
      showToast('Proyecto creado');
      navigate(`/projects/${project.id}`);
    },
    onError: (err: unknown) => {
      setFormError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado');
    },
  });

  function openModal() {
    setFormError(null);
    setModalOpen(true);
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-space-lg">
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-xs text-label-sm uppercase tracking-wider text-secondary">
              <span className="inline-block h-2 w-2 rounded-full bg-secondary" />
              <span>Workspace</span>
            </div>
            <h1 className="text-headline-xl tracking-tight text-on-surface">Mis proyectos</h1>
            <p className="max-w-2xl text-body-md text-on-surface-variant">
              Proyectos donde participás, con el avance real de cada etapa de especificación.
            </p>
          </div>
          <Button onClick={openModal} className="shrink-0">
            <Icon name="add" className="text-[18px]" />
            Nuevo proyecto
          </Button>
        </div>

        {isPending && (
          <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2 lg:grid-cols-3" aria-label="Cargando proyectos">
            <Skeleton variant="block" className="h-40" />
            <Skeleton variant="block" className="h-40" />
            <Skeleton variant="block" className="h-40" />
          </div>
        )}

        {isError && (
          <Alert onRetry={() => refetch()}>
            {error instanceof ApiError ? error.message : 'No se pudieron cargar los proyectos'}
          </Alert>
        )}

        {projects && projects.length === 0 && (
          <EmptyState
            title="Todavía no participás en ningún proyecto"
            description="Creá uno nuevo para empezar a definirlo con GENIAL."
            action={<Button onClick={openModal}>Crear mi primer proyecto</Button>}
          />
        )}

        {projects && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} title="Nuevo proyecto" onClose={() => setModalOpen(false)}>
        <NewProjectForm
          onSubmit={(values) => createMutation.mutate(values)}
          isSubmitting={createMutation.isPending}
          formError={formError}
        />
      </Modal>
    </AppShell>
  );
}
