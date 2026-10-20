import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntityEditor } from '../../src/pages/project/data-model/EntityEditor';
import type { Entity } from '../../src/types/dataModel';

// Wrapper con estado real para probar inputs multi-caracter: EntityEditor
// es un componente controlado, asi que tipear "Project" sin que el padre
// vuelva a renderizar con el valor actualizado solo deja el ultimo caracter.
function StatefulEditor({ initial, onChange }: { initial: Entity[]; onChange: (entities: Entity[]) => void }) {
  const [entities, setEntities] = useState(initial);
  return (
    <EntityEditor
      entities={entities}
      onChange={(next) => {
        setEntities(next);
        onChange(next);
      }}
      disabled={false}
    />
  );
}

const USER_ENTITY: Entity = {
  name: 'User',
  attributes: [
    { name: 'id', type: 'uuid', primaryKey: true, unique: false, nullable: false, foreignKey: null },
    { name: 'email', type: 'string', primaryKey: false, unique: true, nullable: false, foreignKey: null },
  ],
  indexes: [],
};

describe('EntityEditor - edicion inline', () => {
  it('muestra las entidades y atributos recibidos', () => {
    render(<EntityEditor entities={[USER_ENTITY]} onChange={vi.fn()} disabled={false} />);

    expect(screen.getByDisplayValue('User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('id')).toBeInTheDocument();
    expect(screen.getByDisplayValue('email')).toBeInTheDocument();
  });

  it('en modo disabled (viewer) no muestra controles de edicion y los inputs estan deshabilitados', () => {
    render(<EntityEditor entities={[USER_ENTITY]} onChange={vi.fn()} disabled={true} />);

    expect(screen.queryByText('+ Agregar entidad')).not.toBeInTheDocument();
    expect(screen.queryByText('+ Agregar atributo')).not.toBeInTheDocument();
    expect(screen.queryByText('Eliminar entidad')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('User')).toBeDisabled();
  });

  it('editar el nombre de la entidad llama a onChange con el valor actualizado', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EntityEditor entities={[USER_ENTITY]} onChange={onChange} disabled={false} />);

    await user.type(screen.getByDisplayValue('User'), '!');

    expect(onChange).toHaveBeenCalledWith([{ ...USER_ENTITY, name: 'User!' }]);
  });

  it('tildar "es primary key" actualiza el atributo correspondiente', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EntityEditor entities={[USER_ENTITY]} onChange={onChange} disabled={false} />);

    await user.click(screen.getByRole('checkbox', { name: 'email es unique' }));

    expect(onChange).toHaveBeenCalledWith([
      {
        ...USER_ENTITY,
        attributes: [
          USER_ENTITY.attributes[0],
          { ...USER_ENTITY.attributes[1], unique: false },
        ],
      },
    ]);
  });

  it('agregar un atributo nuevo agrega una fila vacia', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EntityEditor entities={[USER_ENTITY]} onChange={onChange} disabled={false} />);

    await user.click(screen.getByText('+ Agregar atributo'));

    const [updated] = onChange.mock.calls[0];
    expect(updated[0].attributes).toHaveLength(3);
    expect(updated[0].attributes[2]).toMatchObject({ name: '', type: 'string', primaryKey: false });
  });

  it('eliminar un atributo lo quita del array', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EntityEditor entities={[USER_ENTITY]} onChange={onChange} disabled={false} />);

    await user.click(screen.getAllByText('Quitar')[1]);

    expect(onChange).toHaveBeenCalledWith([{ ...USER_ENTITY, attributes: [USER_ENTITY.attributes[0]] }]);
  });

  it('agregar una entidad nueva agrega una entidad vacia con un atributo por defecto', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EntityEditor entities={[USER_ENTITY]} onChange={onChange} disabled={false} />);

    await user.click(screen.getByText('+ Agregar entidad'));

    const [updated] = onChange.mock.calls[0];
    expect(updated).toHaveLength(2);
    expect(updated[1]).toMatchObject({ name: '', attributes: [{ name: '', type: 'string' }] });
  });

  it('eliminar la entidad la quita del array', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EntityEditor entities={[USER_ENTITY]} onChange={onChange} disabled={false} />);

    await user.click(screen.getByText('Eliminar entidad'));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('escribir la entidad referenciada activa el campo de atributo FK', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StatefulEditor initial={[USER_ENTITY]} onChange={onChange} />);

    await user.type(screen.getByLabelText('email FK entidad referenciada'), 'Project');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall[0].attributes[1].foreignKey).toEqual({ entity: 'Project', attribute: 'id' });
    expect(screen.getByLabelText('email FK atributo referenciado')).not.toBeDisabled();
  });
});
