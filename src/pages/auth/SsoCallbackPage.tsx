import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Destino del redirect 302 que emite GET /auth/sso/callback en el backend
// tras validar el code de Google: la sesion llega en la querystring (nunca
// via fetch), se persiste y se navega al dashboard (T-011.3).
export function SsoCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: setSession } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    const fullName = searchParams.get('fullName');

    if (token && id && email && fullName) {
      setSession(token, { id, email, fullName });
      navigate('/dashboard', { replace: true });
      return;
    }

    navigate('/login?ssoError=No se pudo completar el inicio de sesión con Google', {
      replace: true,
    });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">Autenticando…</p>
    </div>
  );
}
