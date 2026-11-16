interface Props {
  label?: string;
}

// T-043.1: antes cada pantalla mostraba un "Cargando…" de texto plano sin
// ningun indicador visual.
export function Spinner({ label = 'Cargando…' }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
      {label}
    </div>
  );
}
