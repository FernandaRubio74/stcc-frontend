import type { ReactNode } from 'react';
import { Button } from './Button';
import { AlertTriangleIcon, CheckIcon, InfoIcon } from './icons';

type Tone = 'danger' | 'warning' | 'success' | 'info';

interface Props {
  tone?: Tone;
  children: ReactNode;
  onRetry?: () => void;
}

const TONE_CLASSES: Record<Tone, string> = {
  danger: 'bg-danger-container/30 text-on-danger-container border border-danger/20',
  warning: 'bg-warning-container/30 text-on-warning-container border border-warning/20',
  success: 'bg-tertiary-container/20 text-tertiary-fixed-dim border border-tertiary/20',
  info: 'bg-secondary-container/20 text-secondary-fixed-dim border border-secondary/20',
};

// Un icono por tono, ademas del color: el significado de un Alert no debe
// depender solo del color (WCAG 2.2 AA - ver docs/ui-guidelines.md).
const TONE_ICONS: Record<Tone, typeof AlertTriangleIcon> = {
  danger: AlertTriangleIcon,
  warning: AlertTriangleIcon,
  success: CheckIcon,
  info: InfoIcon,
};

// T-043.3: mensajes de error accionables en vez de texto suelto: cuando hay
// onRetry, el alert trae su propio boton de reintentar.
export function Alert({ tone = 'danger', children, onRetry }: Props) {
  const Icon = TONE_ICONS[tone];
  return (
    <div
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      className={`flex gap-2 rounded-card px-space-md py-space-sm text-body-sm ${TONE_CLASSES[tone]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <div className="space-y-2">
        <div>{children}</div>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}
