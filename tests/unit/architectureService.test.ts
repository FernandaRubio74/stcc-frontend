import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getArchitecture,
  getArchitectureCatalog,
  recommendArchitecture,
  selectArchitecture,
} from '../../src/services/architectureService';

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

describe('architectureService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getArchitectureCatalog hace GET a /architecture/catalog', async () => {
    mockFetchOnce(200, [{ id: 'monolito-modular', name: 'Monolito' }]);

    const result = await getArchitectureCatalog('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/architecture/catalog'),
      expect.anything(),
    );
    expect(result).toEqual([{ id: 'monolito-modular', name: 'Monolito' }]);
  });

  it('getArchitecture hace GET al estado vigente', async () => {
    mockFetchOnce(200, { recommendedId: null, justification: null, selectedId: null, selectedAt: null, selectedById: null });

    await getArchitecture('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/projects/proj-1/architecture'), expect.anything());
  });

  it('recommendArchitecture hace POST a /recommend', async () => {
    mockFetchOnce(201, { recommendedId: 'monolito-modular', justification: 'x', selectedId: null, selectedAt: null, selectedById: null });

    await recommendArchitecture('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/architecture/recommend'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('recommendArchitecture propaga un ApiError 409 si no hay modelo de datos aprobado', async () => {
    mockFetchOnce(409, { error: 'El proyecto todavia no tiene una version aprobada del modelo de datos' });

    await expect(recommendArchitecture('proj-1', 'token')).rejects.toMatchObject({ status: 409 });
  });

  it('selectArchitecture hace POST con el architectureId en el body', async () => {
    mockFetchOnce(200, { recommendedId: null, justification: null, selectedId: 'serverless-managed', selectedAt: '2026-01-01', selectedById: 'u1' });

    await selectArchitecture('proj-1', 'serverless-managed', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/architecture/select'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ architectureId: 'serverless-managed' }) }),
    );
  });

  it('selectArchitecture propaga un ApiError 400 si el id no existe en el catalogo', async () => {
    mockFetchOnce(400, { error: '"no-existe" no es un id de arquitectura valido' });

    await expect(selectArchitecture('proj-1', 'no-existe', 'token')).rejects.toMatchObject({ status: 400 });
  });
});
