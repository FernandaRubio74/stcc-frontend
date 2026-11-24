import { afterEach, describe, expect, it, vi } from 'vitest';
import { inviteMember, removeMember, updateMemberRole } from '../../src/services/membersService';

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }),
  );
}

describe('membersService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('inviteMember propaga un ApiError 404 si el email no corresponde a un usuario', async () => {
    mockFetchOnce(404, { error: 'No existe un usuario registrado con ese email' });

    await expect(
      inviteMember('proj-1', { email: 'x@x.com', role: 'viewer' }, 'token'),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('inviteMember propaga un ApiError 409 si ya es miembro', async () => {
    mockFetchOnce(409, { error: 'El usuario ya es miembro del proyecto' });

    await expect(
      inviteMember('proj-1', { email: 'x@x.com', role: 'viewer' }, 'token'),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('updateMemberRole hace PATCH con el rol en el body', async () => {
    mockFetchOnce(200, { id: 'm1', role: 'editor' });

    await updateMemberRole('proj-1', 'm1', 'editor', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/members/m1'),
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ role: 'editor' }) }),
    );
  });

  it('removeMember propaga un ApiError 409 si es el último owner', async () => {
    mockFetchOnce(409, { error: 'El proyecto debe tener al menos un owner' });

    await expect(removeMember('proj-1', 'm1', 'token')).rejects.toMatchObject({ status: 409 });
  });
});
