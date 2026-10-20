import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateScreenMap, getScreenMap } from '../../src/services/screensService';

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

  it('getScreenMap hace GET y devuelve null si todavia no se genero nada', async () => {
    mockFetchOnce(200, null);

    const result = await getScreenMap('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/projects/proj-1/screens'), expect.anything());
    expect(result).toBeNull();
  });

  it('generateScreenMap hace POST a /generate', async () => {
    mockFetchOnce(201, { screens: [], navigation: [], diagram: 'flowchart TD' });

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
});
