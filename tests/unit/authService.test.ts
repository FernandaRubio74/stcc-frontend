import { afterEach, describe, expect, it, vi } from 'vitest';
import { login, register, getGoogleSsoUrl } from '../../src/services/authService';
import { ApiError } from '../../src/lib/apiClient';

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }),
  );
}

describe('authService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('login envía POST /auth/login y devuelve la sesión', async () => {
    mockFetchOnce(200, { token: 'jwt-token', user: { id: '1', email: 'a@b.com', fullName: 'A' } });

    const result = await login({ email: 'a@b.com', password: 'secreta123' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result).toEqual({ token: 'jwt-token', user: { id: '1', email: 'a@b.com', fullName: 'A' } });
  });

  it('login propaga un ApiError 401 con el mensaje del backend', async () => {
    mockFetchOnce(401, { error: 'Credenciales invalidas' });

    await expect(login({ email: 'a@b.com', password: 'mala' })).rejects.toMatchObject({
      message: 'Credenciales invalidas',
      status: 401,
    } satisfies Partial<ApiError>);
  });

  it('register propaga un ApiError 409 cuando el email ya existe', async () => {
    mockFetchOnce(409, { error: 'El email ya esta registrado' });

    await expect(
      register({ email: 'dup@b.com', password: 'secreta123', fullName: 'Dup' }),
    ).rejects.toMatchObject({ message: 'El email ya esta registrado', status: 409 });
  });

  it('register propaga un ApiError 422 con los detalles de validación', async () => {
    const details = [{ path: ['password'], message: 'La contrasena debe tener al menos 8 caracteres' }];
    mockFetchOnce(422, { error: 'Datos invalidos', details });

    await expect(
      register({ email: 'a@b.com', password: '123', fullName: 'A' }),
    ).rejects.toMatchObject({ message: 'Datos invalidos', status: 422, details });
  });

  it('getGoogleSsoUrl construye la URL de autorización de Google con los parámetros esperados', () => {
    const url = new URL(getGoogleSsoUrl());

    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('redirect_uri')).toBe(
      `${import.meta.env.VITE_API_BASE_URL}/auth/sso/callback`,
    );
  });
});
