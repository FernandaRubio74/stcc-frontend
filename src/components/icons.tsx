/**
 * T-043.x (Fase 2): unico set de iconos del sistema de diseno, como SVG
 * inline (sin libreria de iconos) para no agregar una dependencia solo por
 * esto. Todos aceptan className y son aria-hidden: el significado siempre
 * lo lleva el texto que los acompaña, nunca el icono solo.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function baseProps(props: IconProps): IconProps {
  return {
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  };
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

export function AlertTriangleIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M10 3.5l7.5 13H2.5l7.5-13z" />
      <path d="M10 8.25v3.25" />
      <path d="M10 14.25h.01" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 9.25v4.25" />
      <path d="M10 6.5h.01" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 7.5l5 5 5-5" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M2 10s2.75-5.5 8-5.5S18 10 18 10s-2.75 5.5-8 5.5S2 10 2 10z" />
      <circle cx="10" cy="10" r="2.25" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect height="8.5" rx="1.5" width="12" x="4" y="9" />
      <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M2 10s2.75-5.5 8-5.5c1.6 0 2.95.46 4.05 1.08M18 10s-1 2-3 3.4M10 15.5c-5.25 0-8-5.5-8-5.5a14 14 0 0 1 2.1-2.9" />
      <path d="M3 3l14 14" />
    </svg>
  );
}

interface MaterialIconProps {
  /** Nombre del glyph de Material Symbols (ej. "dashboard", "smart_toy"). */
  name: string;
  className?: string;
  filled?: boolean;
}

/**
 * Glifo de Material Symbols Outlined (ver DESIGN.md del mockup de Stitch:
 * toda la iconografia estructural - header, tarjetas, chat - usa esta
 * fuente, no SVGs sueltos). Se mantiene separado del set de SVG inline de
 * arriba (que sigue usandose en los controles de formulario) porque
 * reemplazar esos íconos accesibles no aporta fidelidad visual real y si
 * agrega riesgo de regresion.
 */
export function Icon({ name, className = '', filled = false }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
