import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SsoCallbackPage } from '../../src/pages/auth/SsoCallbackPage';
import { AuthProvider } from '../../src/store/AuthContext';

function renderAt(path: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/auth/sso/callback" element={<SsoCallbackPage />} />
          <Route path="/dashboard" element={<p>dashboard-stub</p>} />
          <Route path="/login" element={<p>login-stub</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('SsoCallbackPage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('guarda la sesión y redirige al dashboard cuando llegan token y usuario', async () => {
    renderAt('/auth/sso/callback?token=jwt&id=1&email=a@b.com&fullName=Ana');

    expect(await screen.findByText('dashboard-stub')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('ideator.auth')!)).toEqual({
      token: 'jwt',
      user: { id: '1', email: 'a@b.com', fullName: 'Ana' },
    });
  });

  it('redirige al login con un error controlado si falta el token', async () => {
    renderAt('/auth/sso/callback');

    expect(await screen.findByText('login-stub')).toBeInTheDocument();
    expect(localStorage.getItem('ideator.auth')).toBeNull();
  });
});
