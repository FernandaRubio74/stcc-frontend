import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArchitectureSelector } from '../../src/pages/project/architecture/ArchitectureSelector';
import type { ArchitectureScenario, ArchitectureState } from '../../src/types/architecture';

const CATALOG: ArchitectureScenario[] = [
  {
    id: 'monolito-modular',
    name: 'Monolito modular',
    summary: 'resumen 1',
    persistence: 'p',
    backend: 'b',
    frontend: 'f',
    communication: 'c',
    infrastructure: 'i',
    operation: 'o',
    observability: 'ob',
    authSsoAuthorization: 'auth',
  },
  {
    id: 'serverless-managed',
    name: 'Serverless',
    summary: 'resumen 2',
    persistence: 'p',
    backend: 'b',
    frontend: 'f',
    communication: 'c',
    infrastructure: 'i',
    operation: 'o',
    observability: 'ob',
    authSsoAuthorization: 'auth',
  },
];

const EMPTY_STATE: ArchitectureState = {
  recommendedId: null,
  justification: null,
  selectedId: null,
  selectedAt: null,
  selectedById: null,
};

describe('ArchitectureSelector', () => {
  it('muestra las opciones del catalogo', () => {
    render(<ArchitectureSelector catalog={CATALOG} state={EMPTY_STATE} canSelect={true} onSelect={vi.fn()} isSelecting={false} />);

    expect(screen.getByText('Monolito modular')).toBeInTheDocument();
    expect(screen.getByText('Serverless')).toBeInTheDocument();
  });

  it('resalta la opcion recomendada y muestra su justificacion', () => {
    const state: ArchitectureState = {
      ...EMPTY_STATE,
      recommendedId: 'serverless-managed',
      justification: 'MVP chico con carga variable',
    };
    render(<ArchitectureSelector catalog={CATALOG} state={state} canSelect={true} onSelect={vi.fn()} isSelecting={false} />);

    expect(screen.getByText('Recomendada')).toBeInTheDocument();
    expect(screen.getByText('MVP chico con carga variable')).toBeInTheDocument();
  });

  it('marca la opcion confirmada y no le muestra boton de eleccion', () => {
    const state: ArchitectureState = {
      ...EMPTY_STATE,
      selectedId: 'monolito-modular',
      selectedAt: '2026-01-01',
      selectedById: 'u1',
    };
    render(<ArchitectureSelector catalog={CATALOG} state={state} canSelect={true} onSelect={vi.fn()} isSelecting={false} />);

    const card = screen.getByTestId('architecture-card-monolito-modular');
    expect(card).toHaveTextContent('Confirmada');
    expect(within(card).queryByRole('button')).not.toBeInTheDocument();
  });

  it('elegir una opcion llama a onSelect con el id correspondiente', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ArchitectureSelector catalog={CATALOG} state={EMPTY_STATE} canSelect={true} onSelect={onSelect} isSelecting={false} />);

    const serverlessCard = screen.getByTestId('architecture-card-serverless-managed');
    await user.click(within(serverlessCard).getByRole('button'));

    expect(onSelect).toHaveBeenCalledWith('serverless-managed');
  });

  it('cuando canSelect es false no muestra ningun boton de eleccion', () => {
    render(<ArchitectureSelector catalog={CATALOG} state={EMPTY_STATE} canSelect={false} onSelect={vi.fn()} isSelecting={false} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
