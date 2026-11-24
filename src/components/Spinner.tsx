interface Props {
  label?: string;
}

// T-043.1: antes cada pantalla mostraba un "Cargando…" de texto plano sin
// ningun indicador visual.
export function Spinner({ label = 'Cargando…' }: Props) {
  return (
    <div className="flex items-center gap-2 text-body-sm text-on-surface-variant" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-outline-variant border-t-primary motion-reduce:animate-none" />
      {label}
    </div>
  );
}
