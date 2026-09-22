import { apiFetch } from '../lib/apiClient';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function register(payload: RegisterPayload): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginPayload): Promise<AuthSession> {
  return apiFetch<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

const GOOGLE_OAUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

// El redirect_uri debe coincidir exactamente con SSO_CALLBACK_URL del backend
// (y con el autorizado en Google Cloud Console): Google solo puede navegar de
// vuelta ahi, y el backend redirige luego al frontend con la sesion emitida
// (ver sso.controller.js en stcc-backend).
export function getGoogleSsoUrl(): string {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_SSO_CLIENT_ID,
    redirect_uri: `${import.meta.env.VITE_API_BASE_URL}/auth/sso/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
  });
  return `${GOOGLE_OAUTH_ENDPOINT}?${params.toString()}`;
}
