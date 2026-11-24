import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

// Contenedor comun para listas de tarjetas (proyectos, arquitecturas,
// pantallas). `interactive` agrega el hover usado para tarjetas que son
// un link completo (ej. una fila de "Mis proyectos").
export function Card({ children, interactive = false, className = '', ...rest }: Props) {
  return (
    <div
      className={`rounded-card border border-outline-variant/30 bg-surface-container-low p-space-lg shadow-card ${
        interactive ? 'transition hover:border-primary/30 hover:shadow-raised' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
