import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { LoginForm, type LoginFormValues } from './LoginForm';
import { login as loginRequest, getGoogleSsoUrl } from '../../services/authService';
import { ApiError } from '../../lib/apiClient';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login: setSession } = useAuth();
  const [searchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const ssoError = searchParams.get('ssoError');
    if (ssoError) setFormError(ssoError);
    if (searchParams.get('registered')) {
      setNotice('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
    }
  }, [searchParams]);

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (session) => {
      setSession(session.token, session.user);
      navigate('/dashboard', { replace: true });
    },
    onError: (error: unknown) => {
      setFormError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  function handleSubmit(values: LoginFormValues) {
    setFormError(null);
    setNotice(null);
    mutation.mutate(values);
  }

  function handleGoogleClick() {
    window.location.href = getGoogleSsoUrl();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow">
        <h1 className="text-center text-2xl font-semibold text-gray-900">Iniciar sesión</h1>
        {notice && (
          <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {notice}
          </p>
        )}
        <LoginForm
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          formError={formError}
          onGoogleClick={handleGoogleClick}
        />
        <p className="text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
