import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { getProject } from '../../services/projectsService';
import { listMembers, inviteMember, updateMemberRole, removeMember } from '../../services/membersService';
import { MembersPanel } from './MembersPanel';
import { ApiError } from '../../lib/apiClient';
import type { ProjectRole } from '../../types/project';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { Spinner } from '../../components/Spinner';

const STAGE_LINKS = [
  { to: 'wizard', label: 'Definir producto' },
  { to: 'data-model', label: 'Modelo de datos' },
  { to: 'api-spec', label: 'Especificación de API' },
  { to: 'screens', label: 'Mapa de pantallas' },
  { to: 'architecture', label: 'Arquitectura' },
  { to: 'review', label: 'Revisión final' },
];

// STCC-66: vista de detalle y gestion de miembros.
export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [inviteError, setInviteError] = useState<string | null>(null);

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  const membersQuery = useQuery({
    queryKey: ['project', projectId, 'members'],
    queryFn: () => listMembers(projectId as string, token as string),
    enabled: Boolean(token && projectId),
  });

  function invalidateMembers() {
    queryClient.invalidateQueries({ queryKey: ['project', projectId, 'members'] });
  }

  const inviteMutation = useMutation({
    mutationFn: (vars: { email: string; role: ProjectRole }) =>
      inviteMember(projectId as string, vars, token as string),
    onSuccess: () => {
      setInviteError(null);
      invalidateMembers();
    },
    onError: (error: unknown) => {
      setInviteError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  const roleMutation = useMutation({
    mutationFn: (vars: { memberId: string; role: ProjectRole }) =>
      updateMemberRole(projectId as string, vars.memberId, vars.role, token as string),
    onSuccess: invalidateMembers,
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => removeMember(projectId as string, memberId, token as string),
    onSuccess: invalidateMembers,
  });

  if (projectQuery.isPending || membersQuery.isPending) {
    return (
      <div className="p-8">
        <Spinner />
      </div>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <div className="space-y-3 p-8">
        <Alert onRetry={() => projectQuery.refetch()}>
          {projectQuery.error instanceof ApiError ? projectQuery.error.message : 'No se pudo cargar el proyecto'}
        </Alert>
        <Link to="/dashboard" className="text-sm text-indigo-600 hover:underline">
          Volver a mis proyectos
        </Link>
      </div>
    );
  }

  const project = projectQuery.data;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link to="/dashboard" className="text-sm text-indigo-600 hover:underline">
          ← Volver a mis proyectos
        </Link>

        <PageHeader
          title={project.name}
          subtitle={project.description ?? undefined}
          actions={STAGE_LINKS.map((stage, index) => (
            <Link key={stage.to} to={`/projects/${projectId}/${stage.to}`}>
              <Button variant={index === 0 ? 'primary' : 'secondary'}>{stage.label}</Button>
            </Link>
          ))}
        />

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
      </div>
    </div>
  );
}
