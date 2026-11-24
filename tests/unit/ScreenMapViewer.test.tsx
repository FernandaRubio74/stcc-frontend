import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreenMapViewer } from '../../src/pages/project/screens/ScreenMapViewer';
import type { NavigationEdge, Screen } from '../../src/types/screens';

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
  mainElements: [
    { type: 'form', label: 'Formulario de login', dataField: null, endpointRef: 'POST /auth/login' },
    { type: 'button', label: 'Boton de SSO', dataField: null, endpointRef: null },
  ],
  visibleToRoles: ['owner', 'editor', 'viewer'],
};

const DASHBOARD: Screen = {
  name: 'Dashboard',
  purpose: 'Resumen del proyecto',
  mainElements: [{ type: 'list', label: 'Lista de proyectos', dataField: 'Project.name', endpointRef: 'GET /projects' }],
  visibleToRoles: ['owner'],
};

const NAVIGATION: NavigationEdge[] = [{ from: 'Login', to: 'Dashboard', label: 'Inicia sesion' }];

async function esperarNodos() {
  await waitFor(() => expect(screen.getByTestId('screen-map-diagram').querySelector('.node')).toBeInTheDocument());
}

describe('ScreenMapViewer', () => {
  it('muestra un mensaje si todavia no hay mapa generado', () => {
    render(<ScreenMapViewer diagram={null} screens={[]} navigation={[]} />);

    expect(screen.getByText(/todavía no hay un mapa de pantallas generado/i)).toBeInTheDocument();
  });

  it('renderiza el diagrama y no muestra ningun wireframe hasta hacer click', async () => {
    render(<ScreenMapViewer diagram={'flowchart TD'} screens={[LOGIN, DASHBOARD]} navigation={NAVIGATION} />);
    await esperarNodos();

    expect(screen.queryByTestId('screen-mockup')).not.toBeInTheDocument();
  });

  it('hacer click en una pantalla del grafo muestra su wireframe de baja fidelidad', async () => {
    const user = userEvent.setup();
    render(<ScreenMapViewer diagram={'flowchart TD'} screens={[LOGIN, DASHBOARD]} navigation={NAVIGATION} />);
    await esperarNodos();

    await user.click(screen.getByText('Login', { selector: '.node' }));

    const mockup = await screen.findByTestId('screen-mockup');
    expect(mockup).toHaveTextContent('Autenticacion de usuarios');
    expect(mockup).toHaveTextContent('Formulario de login');
  });

  it('cambiar de pantalla seleccionada actualiza el wireframe mostrado', async () => {
    const user = userEvent.setup();
    render(<ScreenMapViewer diagram={'flowchart TD'} screens={[LOGIN, DASHBOARD]} navigation={NAVIGATION} />);
    await esperarNodos();

    await user.click(screen.getByText('Login', { selector: '.node' }));
    await screen.findByTestId('screen-mockup');

    await user.click(screen.getByText('Dashboard', { selector: '.node' }));

    const mockup = await screen.findByTestId('screen-mockup');
    expect(mockup).toHaveTextContent('Resumen del proyecto');
  });

  it('el boton Cerrar oculta el mockup', async () => {
    const user = userEvent.setup();
    render(<ScreenMapViewer diagram={'flowchart TD'} screens={[LOGIN]} navigation={[]} />);
    await esperarNodos();

    await user.click(screen.getByText('Login', { selector: '.node' }));
    await screen.findByTestId('screen-mockup');

    await user.click(screen.getByText('Cerrar'));

    expect(screen.queryByTestId('screen-mockup')).not.toBeInTheDocument();
  });

  it('modo prototipo: clickear la navegacion real lleva a la pantalla destino sin IA', async () => {
    const user = userEvent.setup();
    render(<ScreenMapViewer diagram={'flowchart TD'} screens={[LOGIN, DASHBOARD]} navigation={NAVIGATION} />);
    await esperarNodos();

    await user.click(screen.getByText('Login', { selector: '.node' }));
    const mockup = await screen.findByTestId('screen-mockup');
    expect(mockup).toHaveTextContent('Inicia sesion');

    await user.click(screen.getByRole('button', { name: /Dashboard/ }));

    const nextMockup = await screen.findByTestId('screen-mockup');
    expect(nextMockup).toHaveTextContent('Resumen del proyecto');
  });
});
