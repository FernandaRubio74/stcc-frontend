import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiSpecViewer } from '../../src/pages/project/api-spec/ApiSpecViewer';
import type { Endpoint } from '../../src/types/apiSpec';

// Mismo patron que EntityEditor.test.tsx: ApiSpecViewer es un componente
// controlado, asi que tipear texto sin que el padre vuelva a renderizar con
// el valor actualizado solo deja el ultimo caracter.
function StatefulViewer({ initial, onChange }: { initial: Endpoint[]; onChange: (endpoints: Endpoint[]) => void }) {
  const [endpoints, setEndpoints] = useState(initial);
  return (
    <ApiSpecViewer
      endpoints={endpoints}
      onChange={(next) => {
        setEndpoints(next);
        onChange(next);
      }}
      disabled={false}
    />
  );
}

const LIST_USERS: Endpoint = {
  method: 'GET',
  path: '/users',
  description: 'Lista usuarios',
  resourceEntity: 'User',
  parameters: [{ name: 'limit', in: 'query', type: 'integer', required: false, description: 'paginado' }],
  responses: [
    { status: 200, description: 'ok' },
    { status: 401, description: 'no autenticado' },
  ],
};

const CREATE_ORDER: Endpoint = {
  method: 'POST',
  path: '/orders',
  description: 'Crea una orden',
  resourceEntity: 'Order',
  parameters: [],
  responses: [{ status: 201, description: 'creada' }],
};

describe('ApiSpecViewer', () => {
  it('agrupa los endpoints por entidad y muestra metodo, ruta y codigos de respuesta', () => {
    render(<ApiSpecViewer endpoints={[LIST_USERS, CREATE_ORDER]} onChange={vi.fn()} disabled={false} />);

    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Order')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GET /users' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'POST /orders' })).toBeInTheDocument();
  });

  it('el detalle (parametros, responses) esta colapsado hasta hacer click', async () => {
    const user = userEvent.setup();
    render(<ApiSpecViewer endpoints={[LIST_USERS]} onChange={vi.fn()} disabled={false} />);

    expect(screen.queryByDisplayValue('limit')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'GET /users' }));

    expect(screen.getByDisplayValue('limit')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lista usuarios')).toBeInTheDocument();
  });

  it('en modo disabled (viewer) no muestra controles de edicion y los inputs estan deshabilitados', async () => {
    const user = userEvent.setup();
    render(<ApiSpecViewer endpoints={[LIST_USERS]} onChange={vi.fn()} disabled={true} />);

    await user.click(screen.getByRole('button', { name: 'GET /users' }));

    expect(screen.queryByText('+ Agregar endpoint')).not.toBeInTheDocument();
    expect(screen.queryByText('+ Agregar parametro')).not.toBeInTheDocument();
    expect(screen.queryByText('Eliminar endpoint')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('/users')).toBeDisabled();
  });

  it('editar la ruta de un endpoint llama a onChange con el valor actualizado', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ApiSpecViewer endpoints={[LIST_USERS]} onChange={onChange} disabled={false} />);
    await user.click(screen.getByRole('button', { name: 'GET /users' }));

    await user.type(screen.getByDisplayValue('/users'), '!');

    expect(onChange).toHaveBeenCalledWith([{ ...LIST_USERS, path: '/users!' }]);
  });

  it('agregar una respuesta nueva agrega una fila vacia', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ApiSpecViewer endpoints={[LIST_USERS]} onChange={onChange} disabled={false} />);
    await user.click(screen.getByRole('button', { name: 'GET /users' }));

    await user.click(screen.getByText('+ Agregar respuesta'));

    const [updated] = onChange.mock.calls[0];
    expect(updated[0].responses).toHaveLength(3);
    expect(updated[0].responses[2]).toMatchObject({ status: 200, description: '' });
  });

  it('eliminar un parametro lo quita del array', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ApiSpecViewer endpoints={[LIST_USERS]} onChange={onChange} disabled={false} />);
    await user.click(screen.getByRole('button', { name: 'GET /users' }));

    await user.click(screen.getByRole('button', { name: 'Quitar parametro 1' }));

    expect(onChange).toHaveBeenCalledWith([{ ...LIST_USERS, parameters: [] }]);
  });

  it('agregar un endpoint nuevo agrega una fila vacia con una respuesta 200 por defecto', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ApiSpecViewer endpoints={[LIST_USERS]} onChange={onChange} disabled={false} />);

    await user.click(screen.getByText('+ Agregar endpoint'));

    const [updated] = onChange.mock.calls[0];
    expect(updated).toHaveLength(2);
    expect(updated[1]).toMatchObject({ method: 'GET', path: '', resourceEntity: '' });
    expect(updated[1].responses).toEqual([{ status: 200, description: 'ok' }]);
  });

  it('eliminar el endpoint lo quita del array', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ApiSpecViewer endpoints={[LIST_USERS]} onChange={onChange} disabled={false} />);
    await user.click(screen.getByRole('button', { name: 'GET /users' }));

    await user.click(screen.getByText('Eliminar endpoint'));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('cambiar la entidad referenciada de un endpoint se refleja en el agrupado', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StatefulViewer initial={[LIST_USERS]} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'GET /users' }));

    await user.clear(screen.getByDisplayValue('User'));
    await user.type(screen.getByLabelText('Entidad del modelo de datos'), 'Account');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall[0].resourceEntity).toBe('Account');
  });
});
