import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

// T-043.1/T-043.2: encabezado comun. `actions` envuelve con flex-wrap para
// que una fila con varios botones/enlaces (ej. los 7 de ProjectDetailPage)
// no se desborde en movil en vez de quebrar a una segunda linea.
export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
