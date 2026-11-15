import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentViewer } from '../../src/pages/project/documents/DocumentViewer';
import type { GeneratedDocument } from '../../src/types/documents';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg data-testid="svg-diagrama"></svg>' }),
  },
}));

const CONTENIDO = [
  '# Especificacion del producto',
  '',
  '## 5. Modelo de datos',
  '',
  '| Entidad | Atributos |',
  '| --- | --- |',
  '| Cancha | 3 |',
  '',
  '```mermaid',
  'erDiagram',
  '  CANCHA ||--o{ RESERVA : tiene',
  '```',
].join('\n');

const DOCUMENTO: GeneratedDocument = {
  id: 'doc-1',
  kind: 'SPEC',
  versionNumber: 2,
  createdAt: '2026-11-15T12:00:00.000Z',
  createdById: 'user-1',
  content: CONTENIDO,
};

describe('DocumentViewer', () => {
  it('renderiza el Markdown como HTML, incluidas las tablas GFM', () => {
    render(<DocumentViewer document={DOCUMENTO} onDownload={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Especificacion del producto' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '5. Modelo de datos' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Cancha' })).toBeInTheDocument();
  });

  it('renderiza los bloques mermaid como diagrama en vez de mostrarlos como codigo', async () => {
    render(<DocumentViewer document={DOCUMENTO} onDownload={vi.fn()} />);

    const bloque = screen.getByTestId('mermaid-block');
    await waitFor(() => expect(bloque.innerHTML).toContain('svg'));
    expect(screen.queryByText('erDiagram')).not.toBeInTheDocument();
  });

  it('muestra el tipo y la version del documento', () => {
    render(<DocumentViewer document={DOCUMENTO} onDownload={vi.fn()} />);

    expect(screen.getByText('Especificación del producto')).toBeInTheDocument();
    expect(screen.getByText(/Versión 2/)).toBeInTheDocument();
  });

  it('el boton de descarga dispara onDownload', async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();
    render(<DocumentViewer document={DOCUMENTO} onDownload={onDownload} />);

    await user.click(screen.getByRole('button', { name: 'Descargar .md' }));

    expect(onDownload).toHaveBeenCalledTimes(1);
  });
});
