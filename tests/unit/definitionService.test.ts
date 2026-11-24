import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  advanceDefinitionStage,
  getDefinition,
  listBlockingQuestions,
  postDefinitionMessage,
} from '../../src/services/definitionService';

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

describe('definitionService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getDefinition hace GET al estado del wizard', async () => {
    mockFetchOnce(200, { currentStage: 'PROBLEM_CONTEXT', messages: [], blockingQuestions: [] });

    const result = await getDefinition('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/projects/proj-1/definition'), expect.anything());
    expect(result.currentStage).toBe('PROBLEM_CONTEXT');
  });

  it('postDefinitionMessage hace POST con el contenido en el body', async () => {
    mockFetchOnce(201, { stage: 'PROBLEM_CONTEXT', reply: 'ok', stageComplete: false, blockingQuestions: [] });

    await postDefinitionMessage('proj-1', 'Hola', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/definition/messages'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ content: 'Hola' }) }),
    );
  });

  it('postDefinitionMessage propaga un ApiError 500 si la IA falla', async () => {
    mockFetchOnce(500, { error: 'El asistente de IA no está disponible en este momento, intenta de nuevo' });

    await expect(postDefinitionMessage('proj-1', 'hola', 'token')).rejects.toMatchObject({ status: 500 });
  });

  it('listBlockingQuestions hace GET al listado de bloqueos', async () => {
    mockFetchOnce(200, [{ id: 'b1', stage: 'PROBLEM_CONTEXT', question: '¿Quién?', createdAt: '2026-01-01' }]);

    const result = await listBlockingQuestions('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/definition/blocking-questions'),
      expect.anything(),
    );
    expect(result).toHaveLength(1);
  });

  it('advanceDefinitionStage propaga un ApiError 409 si hay bloqueos activos', async () => {
    mockFetchOnce(409, { error: 'No se puede avanzar de etapa', blockingQuestions: ['¿Quién?'] });

    await expect(advanceDefinitionStage('proj-1', 'token')).rejects.toMatchObject({ status: 409 });
  });

  it('advanceDefinitionStage hace POST sin body', async () => {
    mockFetchOnce(200, { currentStage: 'TARGET_USERS_SCOPE' });

    await advanceDefinitionStage('proj-1', 'token');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/definition/advance'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
