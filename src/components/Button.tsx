import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
  danger: 'border border-red-600 text-red-600 hover:bg-red-50',
};

// T-043.1: unico boton del sistema de diseno. Antes cada pantalla repetia
// sus propias clases de Tailwind para "boton primario"/"boton secundario",
// con pequenas inconsistencias (padding, radios) entre pantallas.
export function Button({ variant = 'primary', loading = false, disabled, className = '', children, ...rest }: Props) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {loading ? 'Cargando…' : children}
    </button>
  );
}
