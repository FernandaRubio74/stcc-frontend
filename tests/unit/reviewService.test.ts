import { afterEach, describe, expect, it, vi } from 'vitest';
import { getReviewSummary, postFinalGeneration } from '../../src/services/reviewService';

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

describe('reviewService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getReviewSummary hace GET a /review-summary', async () => {
    const body = { stages: {}, keyDecisions: {}, blockingQuestions: [], inconsistencies: [], readyToGenerate: false };
    mockFetchOnce(200, body);

    const result = await getReviewSummary('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/projects/proj-1/review-summary'), expect.anything());
    expect(result).toEqual(body);
  });

  it('postFinalGeneration hace POST a /consistency-check/final-generation', async () => {
    mockFetchOnce(200, { status: 'ready', message: 'ok' });

    await postFinalGeneration('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/consistency-check/final-generation'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('postFinalGeneration propaga un ApiError 409 con las inconsistencias si el proyecto no esta listo', async () => {
    mockFetchOnce(409, { error: 'x', issues: [{ rule: 'entities-coverage', stages: [], message: 'x' }] });

    await expect(postFinalGeneration('proj-1', 'token')).rejects.toMatchObject({ status: 409 });
  });
});
