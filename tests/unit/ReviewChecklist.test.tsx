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
};

const NONE_COMPLETE: ReviewSummary['stages'] = {
  definition: { complete: false },
  dataModel: { complete: false },
  apiSpec: { complete: false },
  screens: { complete: false },
  architecture: { complete: false },
};

describe('ReviewChecklist', () => {
  it('muestra cada etapa como completa o pendiente segun su estado', () => {
    render(
      <ReviewChecklist
        stages={NONE_COMPLETE}
        inconsistencies={[]}
        blockingQuestions={[]}
        onNavigateToStage={vi.fn()}
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    expect(screen.getAllByText('⏳ Pendiente')).toHaveLength(5);
    expect(screen.queryByText('✅ Completo')).not.toBeInTheDocument();
  });

  it('una etapa referenciada por una inconsistencia se muestra con conflicto, no como completa', () => {
    render(
      <ReviewChecklist
        stages={ALL_COMPLETE}
        inconsistencies={[{ rule: 'entities-coverage', stages: ['data-model', 'api-spec'], message: 'x' }]}
        blockingQuestions={[]}
        onNavigateToStage={vi.fn()}
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    expect(screen.getAllByText('⚠️ Con conflicto')).toHaveLength(2);
    expect(screen.getAllByText('✅ Completo')).toHaveLength(3);
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
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    await user.click(screen.getByText('Modelo de datos'));

    expect(onNavigateToStage).toHaveBeenCalledWith('dataModel');
  });

  it('hacer click en "Ir a" dentro de un conflicto navega directamente a esa etapa', async () => {
    const user = userEvent.setup();
    const onNavigateToStage = vi.fn();
    render(
      <ReviewChecklist
        stages={ALL_COMPLETE}
        inconsistencies={[{ rule: 'entities-coverage', stages: ['api-spec'], message: 'La API referencia una entidad inexistente' }]}
        blockingQuestions={[]}
        onNavigateToStage={onNavigateToStage}
        readyToGenerate={false}
        onGenerateClick={vi.fn()}
        isGenerating={false}
      />,
    );

    expect(screen.getByText('La API referencia una entidad inexistente')).toBeInTheDocument();
    await user.click(screen.getByText('Ir a Especificación de API'));

    expect(onNavigateToStage).toHaveBeenCalledWith('apiSpec');
  });

  it('muestra las preguntas bloqueantes pendientes', () => {
    render(
      <ReviewChecklist
        stages={NONE_COMPLETE}
        inconsistencies={[]}
        blockingQuestions={[{ id: 'q1', stage: 'PROBLEM_CONTEXT', question: 'Falta definir el publico objetivo', createdAt: '2026-01-01' }]}
        onNavigateToStage={vi.fn()}
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

  it('el boton queda deshabilitado mientras isGenerating es true, incluso si readyToGenerate es true', () => {
    render(
      <ReviewChecklist
        stages={ALL_COMPLETE}
        inconsistencies={[]}
        blockingQuestions={[]}
        onNavigateToStage={vi.fn()}
        readyToGenerate={true}
        onGenerateClick={vi.fn()}
        isGenerating={true}
      />,
    );

    expect(screen.getByRole('button', { name: 'Generando…' })).toBeDisabled();
  });
});
