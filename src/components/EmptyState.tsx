import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
}

// T-043.3: estado vacio homogeneo (titulo + descripcion + accion opcional)
// para reemplazar los "Todavia no hay X" sueltos de cada pantalla.
export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="space-y-2 rounded-card border border-dashed border-outline-variant bg-surface-container-low p-space-xl text-center">
      <p className="text-body-sm font-medium text-on-surface">{title}</p>
      {description && <p className="text-body-sm text-on-surface-variant">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
