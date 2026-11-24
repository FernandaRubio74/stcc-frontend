import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { RegisterForm, type RegisterFormValues } from './RegisterForm';
import { register as registerRequest, getGoogleSsoUrl } from '../../services/authService';
import { ApiError } from '../../lib/apiClient';
import { usePageTitle } from '../../hooks/usePageTitle';

export function RegisterPage() {
  usePageTitle('Crear cuenta');
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: () => {
      navigate('/login?registered=1', { replace: true });
    },
    onError: (error: unknown) => {
      setFormError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  function handleSubmit(values: RegisterFormValues) {
    setFormError(null);
    mutation.mutate(values);
  }

  function handleGoogleClick() {
    window.location.href = getGoogleSsoUrl();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm space-y-6 rounded-dialog border border-outline-variant/30 bg-surface-container-low p-8 shadow-floating">
        <div className="text-center">
          <p className="font-mono text-headline-sm font-semibold tracking-tight text-on-surface">
            <span className="text-primary">{'>'}</span> GENIAL
          </p>
          <h1 className="mt-1 text-headline-lg text-on-surface">Crear cuenta</h1>
        </div>
        <RegisterForm
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          formError={formError}
          onGoogleClick={handleGoogleClick}
        />
        <p className="text-center text-body-sm text-on-surface-variant">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
