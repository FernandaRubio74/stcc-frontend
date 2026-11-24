import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewChecklist } from '../../src/pages/project/review/ReviewChecklist';
import type { ReviewSummary } from '../../src/types/review';

const ALL_COMPLETE: ReviewSummary['stages'] = {
  definition: { complete: true },
  dataModel: { complete: true },
  apiSpec: { complete: true },
  screens: { complete: true },
  architecture: { complete: true },
  testing: { complete: true },
};

const NONE_COMPLETE: ReviewSummary['stages'] = {
  definition: { complete: false },
  dataModel: { complete: false },
  apiSpec: { complete: false },
  screens: { complete: false },
  architecture: { complete: false },
  testing: { complete: false },
};

describe('ReviewChecklist', () => {
  // Regla A/D de la revision transversal: una etapa sin generar es
  // "pendiente de generar", nunca un conflicto - aunque una regla la
  // mencione entre las etapas que compara.
  it('una etapa sin generar se muestra como pendiente, nunca como conflicto', () => {
    render(
      <ReviewChecklist
        stages={NONE_COMPLETE}
        inconsistencies={[
          { rule: 'entities-coverage', stages: ['data-model', 'api-spec'], status: 'error', message: 'x' },
        ]}
        blockingQuestions={[]}
        onNavigateToStage={vi.fn()}
        onNavigateToConflict={vi.fn()}
        onResolveStage={vi.fn()}
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    expect(screen.getAllByText('Pendiente de generar')).toHaveLength(6);
    expect(screen.queryByText('Con conflicto')).not.toBeInTheDocument();
  });

  it('dice que etapas faltan generar cuando no esta listo', () => {
    render(
      <ReviewChecklist
        stages={{ ...ALL_COMPLETE, screens: { complete: false } }}
        inconsistencies={[]}
        blockingQuestions={[]}
        onNavigateToStage={vi.fn()}
        onNavigateToConflict={vi.fn()}
        onResolveStage={vi.fn()}
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    expect(screen.getByText(/Todavía falta generar: Mapa de pantallas/)).toBeInTheDocument();
  });

  // Regla D: solo "error" bloquea. Una advertencia se ve distinta y se
  // lista aparte, aclarando que no bloquea.
  it('una advertencia se muestra como aviso y no como conflicto', () => {
    render(
      <ReviewChecklist
        stages={ALL_COMPLETE}
        inconsistencies={[
          {
            id: 'actors-coverage:no-differentiation',
            rule: 'actors-coverage',
            stages: ['definition', 'data-model'],
            status: 'advertencia',
            message: 'Ninguna etapa posterior diferencia los tipos de usuario',
            suggestion: 'Agregá un campo de rol en la entidad de usuario.',
          },
        ]}
        blockingQuestions={[]}
        onNavigateToStage={vi.fn()}
        onNavigateToConflict={vi.fn()}
        onResolveStage={vi.fn()}
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    expect(screen.getAllByText('Con aviso')).toHaveLength(2);
    expect(screen.queryByText('Con conflicto')).not.toBeInTheDocument();
    expect(screen.getByText('Avisos de consistencia (no bloquean la generación)')).toBeInTheDocument();
    expect(screen.getByText('Agregá un campo de rol en la entidad de usuario.')).toBeInTheDocument();
  });

  it('muestra cada etapa como completa o pendiente segun su estado', () => {
    render(
      <ReviewChecklist
        stages={NONE_COMPLETE}
        inconsistencies={[]}
        blockingQuestions={[]}
        onNavigateToStage={vi.fn()}
        onNavigateToConflict={vi.fn()}
        onResolveStage={vi.fn()}
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    expect(screen.getAllByText('Pendiente de generar')).toHaveLength(6);
    expect(screen.queryByText('Completo')).not.toBeInTheDocument();
  });

  it('una etapa referenciada por una inconsistencia se muestra con conflicto, no como completa', () => {
    render(
      <ReviewChecklist
        stages={ALL_COMPLETE}
        inconsistencies={[{ rule: 'entities-coverage', stages: ['data-model', 'api-spec'], message: 'x' }]}
        blockingQuestions={[]}
        onNavigateToStage={vi.fn()}
        onNavigateToConflict={vi.fn()}
        onResolveStage={vi.fn()}
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    expect(screen.getAllByText('Con conflicto')).toHaveLength(2);
    expect(screen.getAllByText('Completo')).toHaveLength(4);
  });

  it('hacer click en una etapa del checklist navega a esa etapa', async () => {
    const user = userEvent.setup();
    const onNavigateToStage = vi.fn();
    render(
      <ReviewChecklist
        stages={NONE_COMPLETE}
        inconsistencies={[]}
        blockingQuestions={[]}
        onNavigateToStage={onNavigateToStage}
        onNavigateToConflict={vi.fn()}
        onResolveStage={vi.fn()}
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    await user.click(screen.getByText('Modelo de datos'));

    expect(onNavigateToStage).toHaveBeenCalledWith('dataModel');
  });

  it('hacer click en "Ir a" dentro de un conflicto navega a esa etapa pasando el conflicto a resolver', async () => {
    const user = userEvent.setup();
    const onNavigateToConflict = vi.fn();
    const issue = { rule: 'entities-coverage', stages: ['api-spec'], message: 'La API referencia una entidad inexistente' };
    render(
      <ReviewChecklist
        stages={ALL_COMPLETE}
        inconsistencies={[issue]}
        blockingQuestions={[]}
        onNavigateToStage={vi.fn()}
        onNavigateToConflict={onNavigateToConflict}
        onResolveStage={vi.fn()}
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    expect(screen.getByText('La API referencia una entidad inexistente')).toBeInTheDocument();
    await user.click(screen.getByText('Ir a Especificación de API a resolverlo'));

    expect(onNavigateToConflict).toHaveBeenCalledWith('apiSpec', issue, 'api-spec');
  });

  it('el boton "Resolver" de la etapa combina todos los conflictos que la afectan', async () => {
    const user = userEvent.setup();
    const onResolveStage = vi.fn();
    const issueA = { rule: 'entities-coverage', stages: ['api-spec'], message: 'Conflicto A' };
    const issueB = { rule: 'target-users-coverage', stages: ['api-spec'], message: 'Conflicto B' };
    render(
      <ReviewChecklist
        stages={ALL_COMPLETE}
        inconsistencies={[issueA, issueB]}
        blockingQuestions={[]}
        onNavigateToStage={vi.fn()}
        onNavigateToConflict={vi.fn()}
        onResolveStage={onResolveStage}
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Resolver' }));

    expect(onResolveStage).toHaveBeenCalledWith('apiSpec', [
      { issue: issueA, ruleStage: 'api-spec' },
      { issue: issueB, ruleStage: 'api-spec' },
    ]);
  });

  it('no muestra el boton "Resolver" para una etapa sin conflictos', () => {
    render(
      <ReviewChecklist
        stages={ALL_COMPLETE}
        inconsistencies={[]}
        blockingQuestions={[]}
        onNavigateToStage={vi.fn()}
        onNavigateToConflict={vi.fn()}
        onResolveStage={vi.fn()}
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Resolver' })).not.toBeInTheDocument();
  });

  it('muestra las preguntas bloqueantes pendientes', () => {
    render(
      <ReviewChecklist
        stages={NONE_COMPLETE}
        inconsistencies={[]}
        blockingQuestions={[{ id: 'q1', stage: 'PROBLEM_CONTEXT', question: 'Falta definir el publico objetivo', createdAt: '2026-01-01' }]}
        onNavigateToStage={vi.fn()}
        onNavigateToConflict={vi.fn()}
        onResolveStage={vi.fn()}
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    expect(screen.getByText('Falta definir el publico objetivo')).toBeInTheDocument();
  });

  it('el boton de generacion esta deshabilitado si readyToGenerate es false', () => {
    render(
      <ReviewChecklist
        stages={ALL_COMPLETE}
        inconsistencies={[]}
        blockingQuestions={[{ id: 'q1', stage: 'PROBLEM_CONTEXT', question: 'x', createdAt: '2026-01-01' }]}
        onNavigateToStage={vi.fn()}
        onNavigateToConflict={vi.fn()}
        onResolveStage={vi.fn()}
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'Generar documentación final' })).toBeDisabled();
  });

  it('el boton de generacion se habilita cuando readyToGenerate es true y dispara onGenerateClick', async () => {
    const user = userEvent.setup();
    const onGenerateClick = vi.fn();
    render(
      <ReviewChecklist
        stages={ALL_COMPLETE}
        inconsistencies={[]}
        blockingQuestions={[]}
        onNavigateToStage={vi.fn()}
        onNavigateToConflict={vi.fn()}
        onResolveStage={vi.fn()}
        readyToGenerate={true}
        onGenerateClick={onGenerateClick}
        isGenerating={false}
      />,
    );

    const button = screen.getByRole('button', { name: 'Generar documentación final' });
    expect(button).not.toBeDisabled();
    await user.click(button);

    expect(onGenerateClick).toHaveBeenCalledTimes(1);
  });

  it('el boton queda deshabilitado mientras isGenerating es true, incluso si readyToGenerate es true (Button muestra "Cargando…")', () => {
    render(
      <ReviewChecklist
        stages={ALL_COMPLETE}
        inconsistencies={[]}
        blockingQuestions={[]}
        onNavigateToStage={vi.fn()}
        onNavigateToConflict={vi.fn()}
        onResolveStage={vi.fn()}
        readyToGenerate={true}
        onGenerateClick={vi.fn()}
        isGenerating={true}
      />,
    );

    expect(screen.getByRole('button', { name: 'Cargando…' })).toBeDisabled();
  });
});
