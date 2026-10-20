import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreenMapViewer } from '../../src/pages/project/screens/ScreenMapViewer';
import type { Screen } from '../../src/types/screens';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({
      svg: '<svg><g class="node">Login</g><g class="node">Dashboard</g></svg>',
    }),
  },
}));

const LOGIN: Screen = {
  name: 'Login',
  purpose: 'Autenticacion de usuarios',
  mainElements: ['Formulario de login', 'Boton de SSO'],
  visibleToRoles: ['owner', 'editor', 'viewer'],
};

const DASHBOARD: Screen = {
  name: 'Dashboard',
  purpose: 'Resumen del proyecto',
  mainElements: ['Lista de proyectos'],
  visibleToRoles: ['owner'],
};

async function esperarNodos() {
  await waitFor(() => expect(screen.getByTestId('screen-map-diagram').querySelector('.node')).toBeInTheDocument());
}

describe('ScreenMapViewer', () => {
  it('muestra un mensaje si todavia no hay mapa generado', () => {
    render(<ScreenMapViewer diagram={null} screens={[]} />);

    expect(screen.getByText(/todavía no hay un mapa de pantallas generado/i)).toBeInTheDocument();
  });

  it('renderiza el diagrama y no muestra ningun mockup hasta hacer click', async () => {
    render(<ScreenMapViewer diagram={'flowchart TD'} screens={[LOGIN, DASHBOARD]} />);
    await esperarNodos();

    expect(screen.queryByTestId('screen-mockup')).not.toBeInTheDocument();
  });

  it('hacer click en una pantalla del grafo muestra su mockup de baja fidelidad', async () => {
    const user = userEvent.setup();
    render(<ScreenMapViewer diagram={'flowchart TD'} screens={[LOGIN, DASHBOARD]} />);
    await esperarNodos();

    await user.click(screen.getByText('Login', { selector: '.node' }));

    const mockup = await screen.findByTestId('screen-mockup');
    expect(mockup).toHaveTextContent('Autenticacion de usuarios');
    expect(mockup).toHaveTextContent('Formulario de login');
  });

  it('cambiar de pantalla seleccionada actualiza el mockup mostrado', async () => {
    const user = userEvent.setup();
    render(<ScreenMapViewer diagram={'flowchart TD'} screens={[LOGIN, DASHBOARD]} />);
    await esperarNodos();

    await user.click(screen.getByText('Login', { selector: '.node' }));
    await screen.findByTestId('screen-mockup');

    await user.click(screen.getByText('Dashboard', { selector: '.node' }));

    const mockup = await screen.findByTestId('screen-mockup');
    expect(mockup).toHaveTextContent('Resumen del proyecto');
  });

  it('el boton Cerrar oculta el mockup', async () => {
    const user = userEvent.setup();
    render(<ScreenMapViewer diagram={'flowchart TD'} screens={[LOGIN]} />);
    await esperarNodos();

    await user.click(screen.getByText('Login', { selector: '.node' }));
    await screen.findByTestId('screen-mockup');

    await user.click(screen.getByText('Cerrar'));

    expect(screen.queryByTestId('screen-mockup')).not.toBeInTheDocument();
  });
});
