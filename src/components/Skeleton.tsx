type Variant = 'text' | 'circle' | 'block';

interface Props {
  variant?: Variant;
  className?: string;
  /** Cuantas lineas repetir cuando variant="text" (default 1). */
  lines?: number;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  text: 'h-4 rounded',
  circle: 'h-8 w-8 rounded-full',
  block: 'h-24 rounded-card',
};

// Placeholder de carga con forma (no solo un "Cargando…" de texto): da una
// nocion de la estructura que va a aparecer, para pantallas donde el
// contenido final tiene su propio layout reconocible (lista de proyectos,
// tarjetas de arquitectura, etc.).
export function Skeleton({ variant = 'text', className = '', lines = 1 }: Props) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" role="status" aria-label="Cargando">
        {Array.from({ length: lines }).map((_, index) => (
          <span
            key={index}
            className={`block animate-pulse bg-surface-container-high motion-reduce:animate-none ${VARIANT_CLASSES.text} ${
              index === lines - 1 ? 'w-2/3' : 'w-full'
            } ${className}`}
          />
        ))}
      </div>
    );
  }

  return (
    <span
      role="status"
      aria-label="Cargando"
      className={`block animate-pulse bg-surface-container-high motion-reduce:animate-none ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
