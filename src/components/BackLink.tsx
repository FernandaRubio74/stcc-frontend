import { Link } from 'react-router-dom';

interface Props {
  to: string;
  children: string;
}

/**
 * Reemplaza el `<Link>← Volver a...</Link>` que Dashboard y ProjectDetail
 * repetian a mano. La navegacion de la app tiene como maximo un nivel de
 * profundidad real (dashboard -> proyecto -> etapa), asi que un link de
 * "volver" cubre el caso en vez de un Breadcrumb de varios niveles.
 */
export function BackLink({ to, children }: Props) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-body-sm text-on-surface-variant hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-control"
    >
      <span aria-hidden="true">←</span> {children}
    </Link>
  );
}
