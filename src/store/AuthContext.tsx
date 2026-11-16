import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { logout as logoutRequest, type AuthUser } from '../services/authService';

const STORAGE_KEY = 'ideator.auth';

interface StoredSession {
  token: string | null;
  user: AuthUser | null;
}

interface AuthContextValue extends StoredSession {
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredSession(): StoredSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw);
    return { token: parsed.token ?? null, user: parsed.user ?? null };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession>(loadStoredSession);

  const login = useCallback((token: string, user: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    setSession({ token, user });
  }, []);

  // T-042.3/US-043: invalida la sesion tambien del lado del servidor (no
  // solo local). Es best-effort: si la llamada falla (red caida, token ya
  // vencido), la sesion local se limpia igual — no tiene sentido dejar al
  // usuario "atrapado" logueado en el navegador por un error de red.
  const logout = useCallback(async () => {
    const currentToken = session.token;
    localStorage.removeItem(STORAGE_KEY);
    setSession({ token: null, user: null });
    if (currentToken) {
      await logoutRequest(currentToken).catch(() => undefined);
    }
  }, [session.token]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...session, isAuthenticated: Boolean(session.token), login, logout }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
