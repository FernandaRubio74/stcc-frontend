import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getProject } from '../../services/projectsService';
import {
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
} from '../../services/membersService';
import { getReviewSummary } from '../../services/reviewService';
import { MembersPanel } from './MembersPanel';
import { ApiError } from '../../lib/apiClient';
import type { ProjectRole } from '../../types/project';
import { AppShell } from '../../components/AppShell';
import { BackLink } from '../../components/BackLink';
import { PageHeader } from '../../components/PageHeader';
import { Alert } from '../../components/Alert';
import { Skeleton } from '../../components/Skeleton';
import { Stepper } from '../../components/Stepper';
import { buildProjectSteps, getNextStage } from './projectStages';
import { NextStepCard } from './NextStepCard';
import { useToast } from '../../components/Toast';

// STCC-66: vista de detalle y gestion de miembros.
export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [inviteError, setInviteError] = useState<string | null>(null);

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  usePageTitle(projectQuery.data?.name ?? 'Proyecto');

  const membersQuery = useQuery({
    queryKey: ['project', projectId, 'members'],
    queryFn: () => listMembers(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  // Solo para derivar el estado del stepper (que etapa esta completa/
  // bloqueada) - el mismo dato que ya calcula la pantalla de Revision
  // final (US-033), no una regla nueva. Si falla, el stepper degrada a
  // "todo disponible" en vez de romper la pantalla (ver projectStages.ts).
  const reviewQuery = useQuery({
    queryKey: ['project', projectId, 'review-summary'],
    queryFn: () => getReviewSummary(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  function invalidateMembers() {
    queryClient.invalidateQueries({
      queryKey: ['project', projectId, 'members'],
    });
  }

  const inviteMutation = useMutation({
    mutationFn: (vars: { email: string; role: ProjectRole }) =>
      inviteMember(projectId as string, vars, token as string),
    onSuccess: () => {
      setInviteError(null);
      invalidateMembers();
      showToast('Invitación enviada');
    },
    onError: (error: unknown) => {
      setInviteError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  const roleMutation = useMutation({
    mutationFn: (vars: { memberId: string; role: ProjectRole }) =>
      updateMemberRole(projectId as string, vars.memberId, vars.role, token as string),
    onSuccess: () => {
      invalidateMembers();
      showToast('Rol actualizado');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => removeMember(projectId as string, memberId, token as string),
    onSuccess: () => {
      invalidateMembers();
      showToast('Miembro eliminado');
    },
  });

  if (projectQuery.isPending || membersQuery.isPending) {
    return (
      <AppShell>
        <Skeleton variant="text" className="w-48" />
        <Skeleton variant="block" />
      </AppShell>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <AppShell>
        <Alert onRetry={() => projectQuery.refetch()}>
          {projectQuery.error instanceof ApiError
            ? projectQuery.error.message
            : 'No se pudo cargar el proyecto'}
        </Alert>
        <BackLink to="/dashboard">Volver a mis proyectos</BackLink>
      </AppShell>
    );
  }

  const project = projectQuery.data;

  return (
    <AppShell breadcrumb={project.name}>
      <BackLink to="/dashboard">Volver a mis proyectos</BackLink>

      <PageHeader title={project.name} subtitle={project.description ?? undefined} />

      {/* Lo primero que se ve es QUE hacer ahora, no la lista de 8 etapas:
          al crear un proyecto, la accion real (contar la idea) quedaba
          escondida detras del primer paso del stepper. */}
      <NextStepCard next={getNextStage(projectId as string, reviewQuery.data)} />

      <Stepper steps={buildProjectSteps(projectId as string, reviewQuery.data)} />

      {membersQuery.isError ? (
        <Alert onRetry={() => membersQuery.refetch()}>No se pudo cargar la lista de miembros</Alert>
      ) : (
        <MembersPanel
          members={membersQuery.data ?? []}
          currentRole={project.role}
          currentUserId={user?.id ?? ''}
          onInvite={(email, role) => inviteMutation.mutate({ email, role })}
          onChangeRole={(memberId, role) => roleMutation.mutate({ memberId, role })}
          onRemove={(memberId) => removeMutation.mutate(memberId)}
          isInviting={inviteMutation.isPending}
          inviteError={inviteError}
        />
      )}
    </AppShell>
  );
}
