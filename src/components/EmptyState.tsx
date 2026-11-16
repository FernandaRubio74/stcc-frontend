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
    <div className="space-y-2 rounded-md border border-dashed border-gray-300 bg-white p-6 text-center">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
