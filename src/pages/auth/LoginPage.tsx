import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { LoginForm, type LoginFormValues } from './LoginForm';
import { login as loginRequest, getGoogleSsoUrl } from '../../services/authService';
import { ApiError } from '../../lib/apiClient';
import { useAuth } from '../../hooks/useAuth';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Alert } from '../../components/Alert';

export function LoginPage() {
  usePageTitle('Iniciar sesión');
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
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm space-y-6 rounded-dialog border border-outline-variant/30 bg-surface-container-low p-8 shadow-floating">
        <div className="text-center">
          <p className="font-mono text-headline-sm font-semibold tracking-tight text-on-surface">
            <span className="text-primary">{'>'}</span> GENIAL
          </p>
          <h1 className="mt-1 text-headline-lg text-on-surface">Iniciar sesión</h1>
        </div>
        {notice && <Alert tone="success">{notice}</Alert>}
        <LoginForm
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          formError={formError}
          onGoogleClick={handleGoogleClick}
        />
        <p className="text-center text-body-sm text-on-surface-variant">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
