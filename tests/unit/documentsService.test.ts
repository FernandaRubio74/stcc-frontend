import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  downloadDocumentsBundle,
  generateArchitectureDocument,
  generateSpecDocument,
  getDocument,
  listDocuments,
} from '../../src/services/documentsService';

function mockFetchOnce(status: number, body: unknown, extra: Record<string, unknown> = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      ...extra,
    })
  );
}

describe('documentsService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('listDocuments hace GET al historial', async () => {
    mockFetchOnce(200, []);

    await listDocuments('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/projects/proj-1/documents'), expect.anything());
  });

  it('getDocument pide una version puntual', async () => {
    mockFetchOnce(200, { id: 'doc-1', content: '# x' });

    const result = await getDocument('proj-1', 'doc-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/documents/doc-1'),
      expect.anything()
    );
    expect(result.content).toBe('# x');
  });

  it('generateSpecDocument hace POST al endpoint de especificacion', async () => {
    mockFetchOnce(201, { id: 'doc-1', kind: 'SPEC' });

    await generateSpecDocument('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/documents/spec'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('generateArchitectureDocument hace POST al endpoint de arquitectura', async () => {
    mockFetchOnce(201, { id: 'doc-2', kind: 'ARCHITECTURE' });

    await generateArchitectureDocument('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/documents/architecture'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('propaga un ApiError 409 cuando el proyecto no esta listo', async () => {
    mockFetchOnce(409, { error: 'El proyecto todavia no esta listo', blockers: { stages: {} } });

    await expect(generateSpecDocument('proj-1', 'token')).rejects.toMatchObject({
      status: 409,
      message: 'El proyecto todavia no esta listo',
    });
  });

  it('downloadDocumentsBundle devuelve el blob del zip', async () => {
    const blob = new Blob(['zip'], { type: 'application/zip' });
    mockFetchOnce(200, null, { blob: async () => blob });

    const result = await downloadDocumentsBundle('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/documents/bundle'),
      expect.anything()
    );
    expect(result).toBe(blob);
  });

  it('downloadDocumentsBundle propaga el 409 del backend leyendolo como JSON', async () => {
    mockFetchOnce(409, { error: 'Faltan documentos por generar' });

    await expect(downloadDocumentsBundle('proj-1', 'token')).rejects.toMatchObject({
      status: 409,
      message: 'Faltan documentos por generar',
    });
  });
});
