import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { RegisterForm, type RegisterFormValues } from './RegisterForm';
import { register as registerRequest, getGoogleSsoUrl } from '../../services/authService';
import { ApiError } from '../../lib/apiClient';

export function RegisterPage() {
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow">
        <h1 className="text-center text-2xl font-semibold text-gray-900">Crear cuenta</h1>
        <RegisterForm
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          formError={formError}
          onGoogleClick={handleGoogleClick}
        />
        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
