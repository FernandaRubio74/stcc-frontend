import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  approveScreenMapVersion,
  generateScreenMap,
  getScreenMap,
  refineScreens,
  updateScreens,
} from '../../src/services/screensService';

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

describe('screensService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getScreenMap hace GET y devuelve draft/approved en null si todavia no se genero nada', async () => {
    mockFetchOnce(200, { draft: null, approved: null });

    const result = await getScreenMap('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/projects/proj-1/screens'), expect.anything());
    expect(result).toEqual({ draft: null, approved: null });
  });

  it('generateScreenMap hace POST a /generate', async () => {
    mockFetchOnce(201, { status: 'DRAFT', versionNumber: 1, screens: [], navigation: [], diagram: 'flowchart TD' });

    await generateScreenMap('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/screens/generate'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('generateScreenMap propaga un ApiError 409 si no hay API aprobada', async () => {
    mockFetchOnce(409, { error: 'El proyecto todavia no tiene una version aprobada de la especificacion de API' });

    await expect(generateScreenMap('proj-1', 'token')).rejects.toMatchObject({ status: 409 });
  });

  it('updateScreens hace PATCH con screens y navigation', async () => {
    mockFetchOnce(200, { status: 'DRAFT', versionNumber: 1, screens: [], navigation: [], diagram: 'flowchart TD' });

    await updateScreens('proj-1', [], [], 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/screens'),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('approveScreenMapVersion hace POST a /approve', async () => {
    mockFetchOnce(200, { status: 'APPROVED', versionNumber: 1, screens: [], navigation: [], diagram: 'flowchart TD' });

    await approveScreenMapVersion('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/screens/approve'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('refineScreens hace POST a /refine con la instruccion', async () => {
    mockFetchOnce(200, { status: 'DRAFT', versionNumber: 1, screens: [], navigation: [], diagram: 'flowchart TD' });

    await refineScreens('proj-1', 'Agrega filtros a la pantalla de tickets', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/screens/refine'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ instruction: 'Agrega filtros a la pantalla de tickets' }),
      }),
    );
  });
});
