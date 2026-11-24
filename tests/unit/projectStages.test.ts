import { describe, expect, it } from 'vitest';
import { buildProjectSteps } from '../../src/pages/project/projectStages';
import type { ReviewSummary } from '../../src/types/review';

function summaryWith(
  complete: Partial<Record<keyof ReviewSummary['stages'], boolean>>,
  readyToGenerate = false,
): ReviewSummary {
  const base = {
    definition: false,
    dataModel: false,
    apiSpec: false,
    screens: false,
    architecture: false,
    testing: false,
  };
  const merged = { ...base, ...complete };
  return {
    stages: {
      definition: { complete: merged.definition },
      dataModel: { complete: merged.dataModel },
      apiSpec: { complete: merged.apiSpec },
      screens: { complete: merged.screens },
      architecture: { complete: merged.architecture },
      testing: { complete: merged.testing },
    },
    keyDecisions: {
      problemSummary: null,
      dataModelVersion: null,
      apiSpecVersion: null,
      selectedArchitecture: null,
      testPlanVersion: null,
    },
    blockingQuestions: [],
    inconsistencies: [],
    readyToGenerate,
  };
}

describe('buildProjectSteps', () => {
  it('sin review summary, el primer paso esta disponible y el resto bloqueado', () => {
    const steps = buildProjectSteps('p1', undefined);
    expect(steps[0].status).toBe('available');
    expect(steps.slice(1).every((s) => s.status === 'locked')).toBe(true);
  });

  it('una etapa completa habilita la siguiente', () => {
    const steps = buildProjectSteps('p1', summaryWith({ definition: true }));
    expect(steps[0].status).toBe('completed');
    expect(steps[1].status).toBe('available');
    expect(steps[2].status).toBe('locked');
    expect(steps[2].lockedReason).toContain('Modelo de datos');
  });

  it('review queda disponible recien cuando pruebas esta completa, y completa cuando readyToGenerate', () => {
    const casiTodo = summaryWith({
      definition: true,
      dataModel: true,
      apiSpec: true,
      screens: true,
      architecture: true,
    });
    expect(buildProjectSteps('p1', casiTodo)[6].status).toBe('locked');

    const todo = summaryWith({
      definition: true,
      dataModel: true,
      apiSpec: true,
      screens: true,
      architecture: true,
      testing: true,
    });
    expect(buildProjectSteps('p1', todo)[6].status).toBe('available');

    const listo = summaryWith(
      {
        definition: true,
        dataModel: true,
        apiSpec: true,
        screens: true,
        architecture: true,
        testing: true,
      },
      true,
    );
    expect(buildProjectSteps('p1', listo)[6].status).toBe('completed');
  });

  it('pruebas queda bloqueada hasta que arquitectura esta completa', () => {
    const sinArquitectura = summaryWith({
      definition: true,
      dataModel: true,
      apiSpec: true,
      screens: true,
    });
    expect(buildProjectSteps('p1', sinArquitectura)[5].status).toBe('locked');
    expect(buildProjectSteps('p1', sinArquitectura)[5].lockedReason).toContain('Arquitectura');

    const conArquitectura = summaryWith({
      definition: true,
      dataModel: true,
      apiSpec: true,
      screens: true,
      architecture: true,
    });
    expect(buildProjectSteps('p1', conArquitectura)[5].status).toBe('available');
  });

  it('documentos se desbloquea solo cuando readyToGenerate es true', () => {
    const noListo = summaryWith({
      definition: true,
      dataModel: true,
      apiSpec: true,
      screens: true,
      architecture: true,
      testing: true,
    });
    expect(buildProjectSteps('p1', noListo)[7].status).toBe('locked');

    const listo = summaryWith(
      {
        definition: true,
        dataModel: true,
        apiSpec: true,
        screens: true,
        architecture: true,
        testing: true,
      },
      true,
    );
    expect(buildProjectSteps('p1', listo)[7].status).toBe('available');
  });

  it('los pasos con status distinto de locked traen la ruta del proyecto', () => {
    const steps = buildProjectSteps('proyecto-1', summaryWith({ definition: true }));
    expect(steps[0].to).toBe('/projects/proyecto-1/wizard');
    expect(steps[1].to).toBe('/projects/proyecto-1/data-model');
  });
});
