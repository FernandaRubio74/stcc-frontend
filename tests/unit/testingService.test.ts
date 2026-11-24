import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  approveTestPlanVersion,
  generateTestPlan,
  getTestPlan,
  refineTestPlan,
} from '../../src/services/testingService';

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

describe('testingService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getTestPlan hace GET al estado del plan de pruebas', async () => {
    mockFetchOnce(200, { draft: null, approved: null });

    const result = await getTestPlan('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/projects/proj-1/testing'), expect.anything());
    expect(result).toEqual({ draft: null, approved: null });
  });

  it('generateTestPlan hace POST a /generate', async () => {
    mockFetchOnce(201, { id: 'v1', versionNumber: 1, status: 'DRAFT', content: {} });

    await generateTestPlan('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/testing/generate'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('refineTestPlan hace POST a /refine con la instruccion', async () => {
    mockFetchOnce(200, { id: 'v1', versionNumber: 1, status: 'DRAFT', content: {} });

    await refineTestPlan('proj-1', 'Agrega un caso de seguridad mas', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/testing/refine'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ instruction: 'Agrega un caso de seguridad mas' }),
      }),
    );
  });

  it('approveTestPlanVersion hace POST a /approve', async () => {
    mockFetchOnce(200, { id: 'v1', versionNumber: 1, status: 'APPROVED', content: {} });

    await approveTestPlanVersion('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/testing/approve'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
