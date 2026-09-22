import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '../../src/pages/auth/RegisterForm';

describe('RegisterForm', () => {
  it('muestra errores de validación y no llama a onSubmit si los campos están vacíos', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} isSubmitting={false} formError={null} onGoogleClick={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument();
    expect(screen.getByText('El email es requerido')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('exige una contraseña de al menos 8 caracteres', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} isSubmitting={false} formError={null} onGoogleClick={vi.fn()} />);

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Email'), 'ana@example.com');
    await user.type(screen.getByLabelText('Contraseña'), '1234567');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(await screen.findByText('La contraseña debe tener al menos 8 caracteres')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('llama a onSubmit con los valores cuando el formulario es válido', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} isSubmitting={false} formError={null} onGoogleClick={vi.fn()} />);

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Email'), 'ana@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      fullName: 'Ana Pérez',
      email: 'ana@example.com',
      password: 'secreta123',
    });
  });

  it('muestra el error de backend recibido por props (ej. email duplicado)', () => {
    render(
      <RegisterForm
        onSubmit={vi.fn()}
        isSubmitting={false}
        formError="El email ya esta registrado"
        onGoogleClick={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('El email ya esta registrado');
  });

  it('deshabilita el submit mientras isSubmitting es true', () => {
    render(<RegisterForm onSubmit={vi.fn()} isSubmitting formError={null} onGoogleClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: /creando cuenta/i })).toBeDisabled();
  });
});
