import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VersionList } from '../../src/pages/project/documents/VersionList';
import type { DocumentVersion } from '../../src/types/documents';

const VERSIONES: DocumentVersion[] = [
  { id: 'spec-2', kind: 'SPEC', versionNumber: 2, createdAt: '2026-11-15T12:00:00.000Z', createdById: 'u1' },
  { id: 'spec-1', kind: 'SPEC', versionNumber: 1, createdAt: '2026-11-14T12:00:00.000Z', createdById: 'u1' },
  { id: 'arq-1', kind: 'ARCHITECTURE', versionNumber: 1, createdAt: '2026-11-15T12:30:00.000Z', createdById: 'u1' },
];

describe('VersionList', () => {
  it('agrupa el historial por tipo de documento', () => {
    render(<VersionList versions={VERSIONES} selectedId="spec-2" onSelect={vi.fn()} />);

    expect(screen.getByText('Especificación del producto')).toBeInTheDocument();
    expect(screen.getByText('Arquitectura definitiva')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('marca como ultima solo la version mas reciente de cada tipo', () => {
    render(<VersionList versions={VERSIONES} selectedId="spec-2" onSelect={vi.fn()} />);

    // Una por tipo: la v2 de la especificacion y la v1 de la arquitectura.
    expect(screen.getAllByText('última')).toHaveLength(2);
  });

  it('marca la version seleccionada', () => {
    render(<VersionList versions={VERSIONES} selectedId="spec-1" onSelect={vi.fn()} />);

    const seleccionada = screen.getByRole('button', { current: true });
    expect(seleccionada).toHaveTextContent('Versión 1');
  });

  it('al hacer click en una version la informa hacia arriba', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<VersionList versions={VERSIONES} selectedId="spec-2" onSelect={onSelect} />);

    await user.click(screen.getAllByText('Versión 1')[0]);

    expect(onSelect).toHaveBeenCalledWith('spec-1');
  });

  it('avisa cuando un tipo de documento todavia no tiene versiones', () => {
    render(
      <VersionList versions={VERSIONES.filter((v) => v.kind === 'SPEC')} selectedId={null} onSelect={vi.fn()} />
    );

    expect(screen.getByText('Sin versiones generadas')).toBeInTheDocument();
  });
});
