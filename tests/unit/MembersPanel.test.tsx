import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MembersPanel } from '../../src/pages/project/MembersPanel';
import type { ProjectMember } from '../../src/types/project';

const OWNER: ProjectMember = {
  id: 'member-owner',
  role: 'owner',
  createdAt: '2026-01-01T00:00:00.000Z',
  user: { id: 'user-owner', email: 'owner@ideator.com', fullName: 'Dueña' },
};

const EDITOR: ProjectMember = {
  id: 'member-editor',
  role: 'editor',
  createdAt: '2026-01-01T00:00:00.000Z',
  user: { id: 'user-editor', email: 'editor@ideator.com', fullName: 'Editora' },
};

function baseProps() {
  return {
    members: [OWNER, EDITOR],
    onInvite: vi.fn(),
    onChangeRole: vi.fn(),
    onRemove: vi.fn(),
    isInviting: false,
    inviteError: null,
  };
}

describe('MembersPanel - renderizado condicional según rol', () => {
  it('el owner ve el formulario de invitar, selects de rol y botones de eliminar', () => {
    render(<MembersPanel {...baseProps()} currentRole="owner" currentUserId="user-owner" />);

    expect(screen.getByRole('heading', { name: 'Invitar miembro' })).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')).toHaveLength(3); // 2 filas + el select del form de invitar
    expect(screen.getAllByRole('button', { name: 'Eliminar' })).toHaveLength(2);
  });

  it('un editor NO ve el formulario de invitar ni controles de gestión, solo el rol de cada miembro', () => {
    render(<MembersPanel {...baseProps()} currentRole="editor" currentUserId="user-editor" />);

    expect(screen.queryByRole('heading', { name: 'Invitar miembro' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('un viewer tampoco ve controles de gestión', () => {
    render(<MembersPanel {...baseProps()} currentRole="viewer" currentUserId="user-someone-else" />);

    expect(screen.queryByRole('heading', { name: 'Invitar miembro' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
  });

  it('el owner no puede eliminarse a sí mismo mientras sea el único owner', () => {
    render(<MembersPanel {...baseProps()} currentRole="owner" currentUserId="user-owner" />);

    const [removeOwnerButton] = screen.getAllByRole('button', { name: 'Eliminar' });
    expect(removeOwnerButton).toBeDisabled();
  });

  it('el owner invita a un miembro con el email y rol elegidos', async () => {
    const user = userEvent.setup();
    const onInvite = vi.fn();
    render(<MembersPanel {...baseProps()} onInvite={onInvite} currentRole="owner" currentUserId="user-owner" />);

    await user.type(screen.getByLabelText('Email a invitar'), 'nuevo@ideator.com');
    await user.selectOptions(screen.getByLabelText('Rol a asignar'), 'editor');
    await user.click(screen.getByRole('button', { name: 'Invitar' }));

    expect(onInvite).toHaveBeenCalledWith('nuevo@ideator.com', 'editor');
  });

  it('no invita si el email está vacío', async () => {
    const user = userEvent.setup();
    const onInvite = vi.fn();
    render(<MembersPanel {...baseProps()} onInvite={onInvite} currentRole="owner" currentUserId="user-owner" />);

    await user.click(screen.getByRole('button', { name: 'Invitar' }));

    expect(await screen.findByText('El email es requerido')).toBeInTheDocument();
    expect(onInvite).not.toHaveBeenCalled();
  });

  it('el owner cambia el rol de otro miembro', async () => {
    const user = userEvent.setup();
    const onChangeRole = vi.fn();
    render(
      <MembersPanel {...baseProps()} onChangeRole={onChangeRole} currentRole="owner" currentUserId="user-owner" />,
    );

    await user.selectOptions(screen.getByLabelText('Rol de Editora'), 'viewer');

    expect(onChangeRole).toHaveBeenCalledWith('member-editor', 'viewer');
  });

  it('muestra el error de invitación recibido por props', () => {
    render(
      <MembersPanel
        {...baseProps()}
        currentRole="owner"
        currentUserId="user-owner"
        inviteError="El usuario ya es miembro del proyecto"
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('El usuario ya es miembro del proyecto');
  });
});
