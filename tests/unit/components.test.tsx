import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../src/components/Button';
import { Alert } from '../../src/components/Alert';
import { EmptyState } from '../../src/components/EmptyState';
import { Badge } from '../../src/components/Badge';
import { Spinner } from '../../src/components/Spinner';
import { PageHeader } from '../../src/components/PageHeader';

// T-043.4: snapshots de cada componente compartido y sus variantes
// (convencion del repo: solo se testean presentacionales).
describe('Button', () => {
  it('snapshot de cada variante', () => {
    const { container: primary } = render(<Button>Primario</Button>);
    const { container: secondary } = render(<Button variant="secondary">Secundario</Button>);
    const { container: danger } = render(<Button variant="danger">Peligro</Button>);
    expect(primary).toMatchSnapshot();
    expect(secondary).toMatchSnapshot();
    expect(danger).toMatchSnapshot();
  });

  it('loading muestra "Cargando…" y deshabilita el boton', () => {
    render(<Button loading>Guardar</Button>);
    const button = screen.getByRole('button', { name: 'Cargando…' });
    expect(button).toBeDisabled();
  });

  it('dispara onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button', { name: 'Click' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Alert', () => {
  it('snapshot por tono', () => {
    const { container } = render(<Alert tone="warning">Atencion</Alert>);
    expect(container).toMatchSnapshot();
  });

  it('con onRetry muestra el boton de reintentar y lo dispara', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<Alert onRetry={onRetry}>Fallo la carga</Alert>);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('sin onRetry no muestra boton', () => {
    render(<Alert>Solo informativo</Alert>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('snapshot con descripcion y accion', () => {
    const { container } = render(
      <EmptyState title="Sin proyectos" description="Creá el primero" action={<Button>Nuevo</Button>} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('funciona sin descripcion ni accion', () => {
    render(<EmptyState title="Vacio" />);
    expect(screen.getByText('Vacio')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('snapshot por tono', () => {
    const { container } = render(<Badge tone="success">Completo</Badge>);
    expect(container).toMatchSnapshot();
  });
});

describe('Spinner', () => {
  it('muestra la etiqueta por defecto', () => {
    render(<Spinner />);
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('acepta una etiqueta personalizada', () => {
    render(<Spinner label="Generando documento…" />);
    expect(screen.getByText('Generando documento…')).toBeInTheDocument();
  });
});

describe('PageHeader', () => {
  it('snapshot con subtitulo y acciones', () => {
    const { container } = render(
      <PageHeader title="Mis proyectos" subtitle="usuario@ideator.com" actions={<Button>Nuevo</Button>} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('funciona sin subtitulo ni acciones', () => {
    render(<PageHeader title="Solo titulo" />);
    expect(screen.getByRole('heading', { name: 'Solo titulo' })).toBeInTheDocument();
  });
});
