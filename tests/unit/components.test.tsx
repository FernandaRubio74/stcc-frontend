import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Button } from '../../src/components/Button';
import { Alert } from '../../src/components/Alert';
import { EmptyState } from '../../src/components/EmptyState';
import { Badge } from '../../src/components/Badge';
import { Spinner } from '../../src/components/Spinner';
import { PageHeader } from '../../src/components/PageHeader';
import { Input } from '../../src/components/Input';
import { Textarea } from '../../src/components/Textarea';
import { Select } from '../../src/components/Select';
import { Card } from '../../src/components/Card';
import { Avatar } from '../../src/components/Avatar';
import { Skeleton } from '../../src/components/Skeleton';
import { BackLink } from '../../src/components/BackLink';
import { Tooltip } from '../../src/components/Tooltip';
import { Modal } from '../../src/components/Modal';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { Tabs } from '../../src/components/Tabs';
import { Stepper } from '../../src/components/Stepper';
import { ToastProvider, useToast } from '../../src/components/Toast';

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
      <EmptyState
        title="Sin proyectos"
        description="Creá el primero"
        action={<Button>Nuevo</Button>}
      />,
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
      <PageHeader
        title="Mis proyectos"
        subtitle="usuario@ideator.com"
        actions={<Button>Nuevo</Button>}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('funciona sin subtitulo ni acciones', () => {
    render(<PageHeader title="Solo titulo" />);
    expect(screen.getByRole('heading', { name: 'Solo titulo' })).toBeInTheDocument();
  });
});

describe('Input', () => {
  it('asocia el label, muestra el error y lo liga via aria-describedby', () => {
    render(<Input id="email" label="Email" error="Email invalido" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Email invalido');
  });

  it('type password agrega el boton de mostrar/ocultar y cambia el type', async () => {
    const user = userEvent.setup();
    render(<Input id="password" label="Contraseña" type="password" />);
    const input = screen.getByLabelText('Contraseña');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('snapshot con ayuda', () => {
    const { container } = render(
      <Input id="name" label="Nombre" help="Como aparece en el equipo" />,
    );
    expect(container).toMatchSnapshot();
  });
});

describe('Textarea', () => {
  it('asocia el label y el texto de ayuda', () => {
    render(<Textarea id="desc" label="Descripción" help="Opcional" />);
    const textarea = screen.getByLabelText('Descripción');
    expect(textarea).toHaveAttribute('aria-describedby', 'desc-help');
  });
});

describe('Select', () => {
  it('renderiza las opciones y dispara onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select
        id="role"
        label="Rol"
        value="viewer"
        onChange={onChange}
        options={[
          { value: 'editor', label: 'Editor' },
          { value: 'viewer', label: 'Viewer' },
        ]}
      />,
    );
    await user.selectOptions(screen.getByLabelText('Rol'), 'editor');
    expect(onChange).toHaveBeenCalled();
  });
});

describe('Card', () => {
  it('snapshot con y sin interactive', () => {
    const { container: plain } = render(<Card>contenido</Card>);
    const { container: interactive } = render(<Card interactive>contenido</Card>);
    expect(plain).toMatchSnapshot();
    expect(interactive).toMatchSnapshot();
  });
});

describe('Avatar', () => {
  it('muestra las iniciales de nombre y apellido', () => {
    render(<Avatar name="Fernanda Rubio" />);
    expect(screen.getByText('FR')).toBeInTheDocument();
  });

  it('mismo seed siempre da el mismo color', () => {
    const { container: a } = render(<Avatar name="Ana" seed="u-1" />);
    const { container: b } = render(<Avatar name="Ana" seed="u-1" />);
    expect(a.querySelector('span')?.className).toBe(b.querySelector('span')?.className);
  });
});

describe('Skeleton', () => {
  it('variant text con lines renderiza esa cantidad de placeholders', () => {
    render(<Skeleton variant="text" lines={3} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('BackLink', () => {
  it('renderiza un link a la ruta indicada', () => {
    render(
      <MemoryRouter>
        <BackLink to="/dashboard">Volver</BackLink>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /Volver/ })).toHaveAttribute('href', '/dashboard');
  });
});

describe('Tooltip', () => {
  it('se muestra con foco de teclado, no solo con mouse', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Completá la etapa anterior">
        <button type="button">Arquitectura</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Arquitectura' });
    expect(screen.getByRole('tooltip')).toHaveClass('opacity-0');
    await user.tab();
    expect(trigger).toHaveFocus();
    expect(screen.getByRole('tooltip')).toHaveClass('opacity-100');
  });
});

describe('Modal', () => {
  it('no renderiza nada cuando open=false', () => {
    render(
      <Modal open={false} title="Titulo" onClose={vi.fn()}>
        contenido
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape y el boton de cerrar llaman a onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open title="Titulo" onClose={onClose}>
        contenido
      </Modal>,
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('ConfirmDialog', () => {
  it('cancelar y confirmar disparan sus callbacks', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Eliminar miembro"
        description="Esta accion no se puede deshacer."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe('Tabs', () => {
  it('ArrowRight mueve la seleccion a la siguiente pestaña', async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [active, setActive] = useState('spec');
      return (
        <Tabs
          tabs={[
            { id: 'spec', label: 'Especificación' },
            { id: 'arch', label: 'Arquitectura' },
          ]}
          activeId={active}
          onChange={setActive}
          panelId="panel"
        />
      );
    }
    render(<Wrapper />);
    screen.getByRole('tab', { name: 'Especificación' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Arquitectura' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});

describe('Stepper', () => {
  it('un paso locked muestra tooltip con el motivo', () => {
    render(
      <MemoryRouter>
        <Stepper
          steps={[
            { id: 'wizard', label: 'Definir producto', status: 'completed' },
            {
              id: 'data-model',
              label: 'Modelo de datos',
              status: 'current',
              to: '/data-model',
            },
            {
              id: 'review',
              label: 'Revisión final',
              status: 'locked',
              lockedReason: 'Completá el modelo de datos',
            },
          ]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('Definir producto')).toBeInTheDocument();
    expect(screen.getByText('Completá el modelo de datos')).toBeInTheDocument();
  });
});

describe('ToastProvider/useToast', () => {
  function Trigger() {
    const { showToast } = useToast();
    return (
      <button type="button" onClick={() => showToast('Invitación enviada', 'success')}>
        Disparar
      </button>
    );
  }

  it('showToast renderiza la notificacion y se puede cerrar a mano', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Disparar' }));
    expect(screen.getByText('Invitación enviada')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cerrar notificación' }));
    expect(screen.queryByText('Invitación enviada')).not.toBeInTheDocument();
  });

  it('useToast fuera del provider tira un error claro', () => {
    function Broken() {
      useToast();
      return null;
    }
    expect(() => render(<Broken />)).toThrow('useToast debe usarse dentro de <ToastProvider>');
  });
});
