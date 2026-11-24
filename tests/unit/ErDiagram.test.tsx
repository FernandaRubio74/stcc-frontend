import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErDiagram } from '../../src/pages/project/data-model/ErDiagram';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg data-testid="mock-svg"></svg>' }),
  },
}));

describe('ErDiagram', () => {
  it('muestra un mensaje si todavia no hay diagrama', () => {
    render(<ErDiagram diagram={null} />);

    expect(screen.getByText(/todavía no hay un diagrama generado/i)).toBeInTheDocument();
  });

  it('renderiza el SVG devuelto por mermaid cuando hay un diagrama', async () => {
    render(<ErDiagram diagram={'erDiagram\n  USER {\n    uuid id PK\n  }'} />);

    const container = await screen.findByTestId('er-diagram');
    expect(container.innerHTML).toContain('mock-svg');
  });
});
