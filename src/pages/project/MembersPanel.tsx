import { useState, type FormEvent } from 'react';
import type { ProjectMember, ProjectRole } from '../../types/project';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Alert } from '../../components/Alert';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const ROLE_LABELS: Record<ProjectRole, string> = {
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer',
};

const ROLE_BADGE_TONE: Record<ProjectRole, 'info' | 'neutral' | 'warning'> = {
  owner: 'info',
  editor: 'neutral',
  viewer: 'warning',
};

const ROLE_OPTIONS = (['owner', 'editor', 'viewer'] as ProjectRole[]).map((r) => ({
  value: r,
  label: ROLE_LABELS[r],
}));

interface MembersPanelProps {
  members: ProjectMember[];
  currentRole: ProjectRole;
  currentUserId: string;
  onInvite: (email: string, role: ProjectRole) => void;
  onChangeRole: (memberId: string, role: ProjectRole) => void;
  onRemove: (memberId: string) => void;
  isInviting: boolean;
  inviteError: string | null;
}

// STCC-66: solo el owner puede invitar, cambiar roles o eliminar miembros.
// Para cualquier otro rol esas acciones estan ocultas, no solo deshabilitadas.
export function MembersPanel({
  members,
  currentRole,
  currentUserId,
  onInvite,
  onChangeRole,
  onRemove,
  isInviting,
  inviteError,
}: MembersPanelProps) {
  const canManage = currentRole === 'owner';
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ProjectRole>('viewer');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);

  function handleInviteSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      setValidationError('El email es requerido');
      return;
    }
    setValidationError(null);
    onInvite(email.trim(), role);
    setEmail('');
  }

  return (
    <div className="space-y-4">
      <h2 className="text-headline-md text-on-surface">Miembros</h2>

      <ul className="divide-y divide-outline-variant/30 rounded-card border border-outline-variant/30 bg-surface-container-low">
        {members.map((member) => {
          const isSelfOwner = member.user.id === currentUserId && member.role === 'owner';
          return (
            <li
              key={member.id}
              className="flex flex-col items-stretch gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={member.user.fullName} seed={member.user.id} />
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-medium text-on-surface">
                    {member.user.fullName}
                  </p>
                  <p className="truncate text-label-sm text-outline">{member.user.email}</p>
                </div>
              </div>

              {canManage ? (
                <div className="flex items-center gap-2">
                  <div className="w-28">
                    <Select
                      id={`role-${member.id}`}
                      label={`Rol de ${member.user.fullName}`}
                      hideLabel
                      value={member.role}
                      onChange={(e) => onChangeRole(member.id, e.target.value as ProjectRole)}
                      options={ROLE_OPTIONS}
                    />
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setMemberToRemove(member)}
                    disabled={isSelfOwner}
                    title={isSelfOwner ? 'No podés eliminarte siendo el único owner' : undefined}
                  >
                    Eliminar
                  </Button>
                </div>
              ) : (
                <Badge tone={ROLE_BADGE_TONE[member.role]}>{ROLE_LABELS[member.role]}</Badge>
              )}
            </li>
          );
        })}
      </ul>

      {canManage && (
        <form
          onSubmit={handleInviteSubmit}
          className="space-y-3 rounded-card border border-outline-variant/30 bg-surface-container-low p-4"
        >
          <h3 className="text-body-sm font-medium text-on-surface">Invitar miembro</h3>

          {inviteError && <Alert>{inviteError}</Alert>}

          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[14rem] flex-1">
              <Input
                id="invite-email"
                type="email"
                label="Email a invitar"
                placeholder="email@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={validationError ?? undefined}
              />
            </div>
            <div className="w-32">
              <Select
                id="invite-role"
                label="Rol a asignar"
                value={role}
                onChange={(e) => setRole(e.target.value as ProjectRole)}
                options={ROLE_OPTIONS}
              />
            </div>
            <Button type="submit" loading={isInviting}>
              Invitar
            </Button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={memberToRemove !== null}
        title="Eliminar miembro"
        description={
          memberToRemove
            ? `${memberToRemove.user.fullName} va a perder acceso al proyecto. Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={() => {
          if (memberToRemove) onRemove(memberToRemove.id);
          setMemberToRemove(null);
        }}
        onCancel={() => setMemberToRemove(null)}
      />
    </div>
  );
}
