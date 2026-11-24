import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

// Ver DESIGN.md "Components > 1. Buttons" del mockup: primary es
// bg-primary-container/text-on-primary-container con brillo al hover;
// secondary es "ghost" (transparente, borde sutil); danger sigue el mismo
// patron "container" que primary pero con los tokens de error.
const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-primary-container text-on-primary-container border border-primary/30 hover:brightness-110 shadow-sm',
  secondary:
    'bg-transparent border border-outline-variant text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
  danger: 'bg-danger-container text-on-danger-container border border-danger/30 hover:brightness-110 shadow-sm',
};

// Alturas del propio DESIGN.md ("Dense" 28px / "Default" 36px). "lg" no
// esta en el mockup (pensado para desktop/dense); se agrega para el unico
// caso donde un objetivo tactil mas grande importa de verdad (ley de Fitts
// en mobile), sin forzarlo en el resto de una UI explicitamente densa.
const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-7 px-2 text-label-md',
  md: 'h-9 px-3 text-body-sm',
  lg: 'min-h-11 px-5 text-body-md',
};

// Area de toque minima real (Material: 48dp: Apple HIG: 44pt) sin agrandar
// el tamaño VISUAL del boton: un pseudo-elemento invisible (`::before`)
// extiende el area clickeable/tocable por fuera de la caja visible. "lg"
// ya mide 44px de alto y no necesita nada extra; "sm"/"md" son densos a
// proposito (ver nota de arriba) pero igual tienen que cumplir el minimo
// de accesibilidad tactil.
const HIT_SLOP_CLASSES: Record<Size, string> = {
  sm: "relative before:absolute before:inset-x-0 before:-top-2 before:-bottom-2 before:content-['']",
  md: "relative before:absolute before:inset-x-0 before:-top-1 before:-bottom-1 before:content-['']",
  lg: '',
};

// T-043.1: unico boton del sistema de diseno. Antes cada pantalla repetia
// sus propias clases de Tailwind para "boton primario"/"boton secundario",
// con pequenas inconsistencias (padding, radios) entre pantallas.
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-control font-medium transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${SIZE_CLASSES[size]} ${HIT_SLOP_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
        />
      )}
      {loading ? 'Cargando…' : children}
    </button>
  );
}
