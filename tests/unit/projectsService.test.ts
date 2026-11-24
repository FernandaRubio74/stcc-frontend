import { afterEach, describe, expect, it, vi } from 'vitest';
import { listProjects, createProject, getProject } from '../../src/services/projectsService';

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

describe('projectsService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('listProjects envía el token como Authorization header', async () => {
    mockFetchOnce(200, [{ id: '1', name: 'A' }]);

    await listProjects('mi-token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer mi-token' }) }),
    );
  });

  it('createProject hace POST con el body serializado', async () => {
    mockFetchOnce(201, { id: '1', name: 'Nuevo' });

    const result = await createProject({ name: 'Nuevo' }, 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'Nuevo' }) }),
    );
    expect(result).toEqual({ id: '1', name: 'Nuevo' });
  });

  it('getProject propaga un ApiError 404 si el proyecto no existe o no es miembro', async () => {
    mockFetchOnce(404, { error: 'Proyecto no encontrado' });

    await expect(getProject('x', 'token')).rejects.toMatchObject({
      message: 'Proyecto no encontrado',
      status: 404,
    });
  });
});
