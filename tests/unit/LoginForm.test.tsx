import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../../src/pages/auth/LoginForm';

describe('LoginForm', () => {
  it('muestra errores de validación y no llama a onSubmit si los campos están vacíos', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} isSubmitting={false} formError={null} onGoogleClick={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /^iniciar sesión$/i }));

    expect(await screen.findByText('El email es requerido')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('marca error cuando el email tiene formato inválido', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} isSubmitting={false} formError={null} onGoogleClick={vi.fn()} />);

    await user.type(screen.getByLabelText('Email'), 'no-es-un-email');
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123');
    await user.click(screen.getByRole('button', { name: /^iniciar sesión$/i }));

    expect(await screen.findByText('Ingresa un email válido')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('llama a onSubmit con los valores cuando el formulario es válido', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} isSubmitting={false} formError={null} onGoogleClick={vi.fn()} />);

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123');
    await user.click(screen.getByRole('button', { name: /^iniciar sesión$/i }));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secreta123' });
  });

  it('muestra el error de backend recibido por props', () => {
    render(
      <LoginForm onSubmit={vi.fn()} isSubmitting={false} formError="Credenciales invalidas" onGoogleClick={vi.fn()} />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Credenciales invalidas');
  });

  it('deshabilita el submit y cambia el texto mientras isSubmitting es true', () => {
    render(<LoginForm onSubmit={vi.fn()} isSubmitting formError={null} onGoogleClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: /iniciando sesión/i })).toBeDisabled();
  });

  it('invoca onGoogleClick al hacer click en el botón de Google', async () => {
    const user = userEvent.setup();
    const onGoogleClick = vi.fn();
    render(<LoginForm onSubmit={vi.fn()} isSubmitting={false} formError={null} onGoogleClick={onGoogleClick} />);

    await user.click(screen.getByRole('button', { name: /iniciar sesión con google/i }));
    expect(onGoogleClick).toHaveBeenCalledTimes(1);
  });
});
