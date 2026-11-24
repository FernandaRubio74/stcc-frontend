import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StageAssistant } from '../../src/components/StageAssistant';

describe('StageAssistant', () => {
  it('llama a onSubmit con la instruccion escrita y limpia el campo al terminar', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<StageAssistant id="data-model" placeholder="placeholder" onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText('placeholder');
    await user.type(textarea, 'Agrega una entidad Proveedor');
    await user.click(screen.getByRole('button', { name: /aplicar con ia/i }));

    expect(onSubmit).toHaveBeenCalledWith('Agrega una entidad Proveedor');
    expect(await screen.findByPlaceholderText('placeholder')).toHaveValue('');
  });

  it('muestra el error devuelto por onSubmit sin limpiar el campo', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('El asistente de IA no esta disponible'));
    render(<StageAssistant id="data-model" placeholder="placeholder" onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('placeholder'), 'Agrega una entidad Proveedor');
    await user.click(screen.getByRole('button', { name: /aplicar con ia/i }));

    expect(await screen.findByText('El asistente de IA no esta disponible')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder')).toHaveValue('Agrega una entidad Proveedor');
  });

  it('cuando esta deshabilitado, muestra el motivo en vez del formulario', () => {
    render(
      <StageAssistant
        id="data-model"
        placeholder="placeholder"
        onSubmit={vi.fn()}
        disabled
        disabledReason="Solo el owner o un editor puede ajustar esto."
      />,
    );

    expect(screen.getByText('Solo el owner o un editor puede ajustar esto.')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('placeholder')).not.toBeInTheDocument();
  });

  it('precarga el campo con initialInstruction (ej. al llegar desde "Ir a X a resolverlo")', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <StageAssistant
        id="data-model"
        placeholder="placeholder"
        onSubmit={onSubmit}
        initialInstruction='Agregá de nuevo la entidad "Pedido" al modelo de datos.'
      />,
    );

    expect(screen.getByPlaceholderText('placeholder')).toHaveValue('Agregá de nuevo la entidad "Pedido" al modelo de datos.');

    await user.click(screen.getByRole('button', { name: /aplicar con ia/i }));

    expect(onSubmit).toHaveBeenCalledWith('Agregá de nuevo la entidad "Pedido" al modelo de datos.');
  });
});
