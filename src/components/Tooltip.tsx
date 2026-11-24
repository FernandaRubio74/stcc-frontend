import { cloneElement, useId, useState, type ReactElement } from 'react';

interface Props {
  content: string;
  children: ReactElement;
}

/**
 * Tooltip accesible: se muestra con hover Y con foco de teclado (no solo
 * mouse), y el disparador queda descrito via aria-describedby - pensado
 * sobre todo para explicar por que una etapa del stepper esta bloqueada
 * (Fase 3) sin tener que agregar un titulo largo al lado de cada paso.
 */
export function Tooltip({ content, children }: Props) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  const trigger = cloneElement(children, {
    'aria-describedby': id,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  });

  return (
    <span className="relative inline-flex">
      {trigger}
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-control border border-outline-variant/40 bg-surface-container-highest px-2 py-1 text-label-sm normal-case text-on-surface shadow-raised transition-opacity motion-reduce:transition-none ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {content}
      </span>
    </span>
  );
}
