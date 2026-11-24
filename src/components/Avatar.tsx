interface Props {
  name: string;
  /** Semilla para elegir el color (ej. el id del usuario) - por defecto usa `name`. */
  seed?: string;
}

const PALETTE = [
  'bg-primary-container/30 text-primary',
  'bg-tertiary-container/30 text-tertiary',
  'bg-warning-container/30 text-warning',
  'bg-danger-container/30 text-danger',
  'bg-secondary-container/30 text-secondary',
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

// Las personas de un proyecto no tienen foto en el modelo de datos: se
// muestran como iniciales sobre un color estable (mismo usuario -> mismo
// color siempre, derivado de `seed`/`name`).
export function Avatar({ name, seed }: Props) {
  return (
    <span
      className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${colorFor(seed ?? name)}`}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}
