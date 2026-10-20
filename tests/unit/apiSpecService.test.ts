import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  approveApiSpecVersion,
  generateApiSpec,
  getApiSpec,
  updateApiSpecEndpoints,
} from '../../src/services/apiSpecService';

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

describe('apiSpecService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getApiSpec hace GET al estado de la especificacion', async () => {
    mockFetchOnce(200, { draft: null, approved: null });

    const result = await getApiSpec('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/projects/proj-1/api-spec'), expect.anything());
    expect(result).toEqual({ draft: null, approved: null });
  });

  it('generateApiSpec hace POST a /generate', async () => {
    mockFetchOnce(201, { id: 'v1', versionNumber: 1, status: 'DRAFT', endpoints: [] });

    await generateApiSpec('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/api-spec/generate'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('generateApiSpec propaga un ApiError 409 si no hay modelo de datos aprobado', async () => {
    mockFetchOnce(409, { error: 'El proyecto todavia no tiene una version aprobada del modelo de datos' });

    await expect(generateApiSpec('proj-1', 'token')).rejects.toMatchObject({ status: 409 });
  });

  it('updateApiSpecEndpoints hace PATCH con los endpoints en el body', async () => {
    const endpoints = [
      {
        method: 'GET',
        path: '/users',
        description: 'Lista usuarios',
        resourceEntity: 'User',
        parameters: [],
        responses: [{ status: 200, description: 'ok' }],
      },
    ];
    mockFetchOnce(200, { id: 'v1', versionNumber: 1, status: 'DRAFT', endpoints });

    await updateApiSpecEndpoints('proj-1', endpoints, 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/api-spec/endpoints'),
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ endpoints }) }),
    );
  });

  it('updateApiSpecEndpoints propaga un ApiError 403 si el usuario no tiene permisos', async () => {
    mockFetchOnce(403, { error: 'No tiene permisos para esta accion' });

    await expect(updateApiSpecEndpoints('proj-1', [], 'token')).rejects.toMatchObject({ status: 403 });
  });

  it('approveApiSpecVersion hace POST a /approve', async () => {
    mockFetchOnce(200, { id: 'v1', versionNumber: 1, status: 'APPROVED', endpoints: [] });

    await approveApiSpecVersion('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/api-spec/approve'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('approveApiSpecVersion propaga un ApiError 409 si no hay draft para aprobar', async () => {
    mockFetchOnce(409, { error: 'No hay una version en edicion para aprobar' });

    await expect(approveApiSpecVersion('proj-1', 'token')).rejects.toMatchObject({ status: 409 });
  });
});
