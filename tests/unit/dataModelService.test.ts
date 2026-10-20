import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  approveDataModelVersion,
  generateDataModel,
  getDataModel,
  updateDataModelEntities,
} from '../../src/services/dataModelService';

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

describe('dataModelService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getDataModel hace GET al estado del modelo', async () => {
    mockFetchOnce(200, { draft: null, approved: null });

    const result = await getDataModel('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/projects/proj-1/data-model'), expect.anything());
    expect(result).toEqual({ draft: null, approved: null });
  });

  it('generateDataModel hace POST a /generate', async () => {
    mockFetchOnce(201, { id: 'v1', versionNumber: 1, status: 'DRAFT', entities: [], diagram: null });

    await generateDataModel('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/data-model/generate'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('generateDataModel propaga un ApiError 409 si la definicion esta incompleta', async () => {
    mockFetchOnce(409, { error: 'Todavia falta completar la definicion' });

    await expect(generateDataModel('proj-1', 'token')).rejects.toMatchObject({ status: 409 });
  });

  it('updateDataModelEntities hace PATCH con las entidades en el body', async () => {
    const entities = [{ name: 'User', attributes: [], indexes: [] }];
    mockFetchOnce(200, { id: 'v1', versionNumber: 1, status: 'DRAFT', entities, diagram: null });

    await updateDataModelEntities('proj-1', entities, 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/data-model/entities'),
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ entities }) }),
    );
  });

  it('updateDataModelEntities propaga un ApiError 403 si el usuario no tiene permisos', async () => {
    mockFetchOnce(403, { error: 'No tiene permisos para esta accion' });

    await expect(updateDataModelEntities('proj-1', [], 'token')).rejects.toMatchObject({ status: 403 });
  });

  it('approveDataModelVersion hace POST a /approve', async () => {
    mockFetchOnce(200, { id: 'v1', versionNumber: 1, status: 'APPROVED', entities: [], diagram: null });

    await approveDataModelVersion('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/data-model/approve'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('approveDataModelVersion propaga un ApiError 409 si no hay draft para aprobar', async () => {
    mockFetchOnce(409, { error: 'No hay una version en edicion para aprobar' });

    await expect(approveDataModelVersion('proj-1', 'token')).rejects.toMatchObject({ status: 409 });
  });
});
