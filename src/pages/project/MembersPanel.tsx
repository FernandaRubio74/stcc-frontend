import { useState, type FormEvent } from 'react';
import type { ProjectMember, ProjectRole } from '../../types/project';

const ROLE_LABELS: Record<ProjectRole, string> = {
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer',
};

const ASSIGNABLE_ROLES: ProjectRole[] = ['owner', 'editor', 'viewer'];

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
      <h2 className="text-lg font-semibold text-gray-900">Miembros</h2>

      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {members.map((member) => {
          const isSelfOwner = member.user.id === currentUserId && member.role === 'owner';
          return (
            <li key={member.id} className="flex items-center justify-between gap-4 p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{member.user.fullName}</p>
                <p className="text-xs text-gray-500">{member.user.email}</p>
              </div>

              {canManage ? (
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`role-${member.id}`}>
                    Rol de {member.user.fullName}
                  </label>
                  <select
                    id={`role-${member.id}`}
                    value={member.role}
                    onChange={(e) => onChangeRole(member.id, e.target.value as ProjectRole)}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                  >
                    {ASSIGNABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => onRemove(member.id)}
                    disabled={isSelfOwner}
                    title={isSelfOwner ? 'No podés eliminarte siendo el único owner' : undefined}
                    className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                  {ROLE_LABELS[member.role]}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {canManage && (
        <form
          onSubmit={handleInviteSubmit}
          className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
        >
          <h3 className="text-sm font-medium text-gray-900">Invitar miembro</h3>

          {inviteError && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {inviteError}
            </p>
          )}
          {validationError && <p className="text-sm text-red-600">{validationError}</p>}

          <div className="flex gap-2">
            <input
              type="email"
              placeholder="email@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email a invitar"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as ProjectRole)}
              aria-label="Rol a asignar"
              className="rounded-md border border-gray-300 px-2 py-2 text-sm"
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={isInviting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isInviting ? 'Invitando…' : 'Invitar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
