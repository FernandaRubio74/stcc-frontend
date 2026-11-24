import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { Icon } from './icons';

interface Props {
  children: ReactNode;
  /** Nombre del proyecto activo, para el breadcrumb "Proyectos / <nombre>"
   * del header (ver DESIGN.md "Project Spec Metadata Strip"). Se omite en
   * pantallas que no estan dentro de un proyecto (ej. el dashboard). */
  breadcrumb?: string;
}

/**
 * Cascara comun de toda pantalla autenticada. Header fijo de 16 (igual que
 * el mockup de Stitch: logo + separador + breadcrumb + perfil), SIN la
 * sidebar/buscador(⌘K)/notificaciones/ajustes del mockup original - el
 * usuario pidio explicitamente mantener la navegacion real de la app (un
 * solo nivel real: dashboard -> proyecto -> etapa) y omitir lo decorativo
 * que no tiene funcionalidad real detras.
 */
export function AppShell({ children, breadcrumb }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Apple HIG (viewport-fit=cover, ver index.html): el header fijo
       * suma el inset superior real del dispositivo (notch/isla dinamica)
       * en vez de quedar tapado por el, y lo mismo a los costados en
       * landscape - en navegadores/Android sin recorte esos env() valen
       * 0px, así que no cambia nada ahi. */
      }
      <header
        className="fixed inset-x-0 top-0 z-50 h-[calc(4rem+var(--safe-area-top))] border-b border-surface-variant/40 bg-surface-container-low/90 backdrop-blur-xl"
        style={{ paddingLeft: 'var(--safe-area-left)', paddingRight: 'var(--safe-area-right)' }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-space-lg px-gutter [margin-top:var(--safe-area-top)]">
          <div className="flex min-w-0 items-center gap-space-lg">
            <Link to="/dashboard" className="flex shrink-0 items-center gap-space-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                <Icon name="hub" className="text-[18px]" />
              </span>
              <span className="text-headline-sm font-semibold tracking-tight text-on-surface">
                GENIAL
              </span>
            </Link>
            {breadcrumb && (
              <>
                <div className="hidden h-5 w-px shrink-0 bg-surface-variant sm:block" />
                <div className="hidden min-w-0 items-center gap-space-xs text-body-sm sm:flex">
                  <span className="shrink-0 text-on-surface-variant">Proyectos</span>
                  <span className="shrink-0 text-label-sm text-outline">/</span>
                  <span className="truncate rounded bg-surface-container px-space-xs py-0.5 font-mono text-code-sm font-medium text-on-surface">
                    {breadcrumb}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-space-md">
            {user?.fullName && (
              <div className="hidden items-center gap-space-sm sm:flex">
                <Avatar name={user.fullName} seed={user.id} />
                <span className="max-w-[10rem] truncate text-label-md font-medium text-on-surface">
                  {user.fullName}
                </span>
              </div>
            )}
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>
      <main
        className="mx-auto max-w-6xl space-y-6 px-gutter pt-[calc(6rem+var(--safe-area-top))]"
        style={{
          paddingLeft: 'max(var(--spacing-gutter), var(--safe-area-left))',
          paddingRight: 'max(var(--spacing-gutter), var(--safe-area-right))',
          paddingBottom: 'max(1.5rem, var(--safe-area-bottom))',
        }}
      >
        {children}
      </main>
    </div>
  );
}
