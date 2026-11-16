import type { ReactNode } from 'react';
import { Button } from './Button';

type Tone = 'error' | 'warning' | 'success' | 'info';

interface Props {
  tone?: Tone;
  children: ReactNode;
  onRetry?: () => void;
}

const TONE_CLASSES: Record<Tone, string> = {
  error: 'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-900',
  success: 'bg-green-50 text-green-700',
  info: 'bg-blue-50 text-blue-700',
};

// T-043.3: mensajes de error accionables en vez de texto suelto: cuando hay
// onRetry, el alert trae su propio boton de reintentar.
export function Alert({ tone = 'error', children, onRetry }: Props) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`space-y-2 rounded-md px-3 py-2 text-sm ${TONE_CLASSES[tone]}`}>
      <p>{children}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="text-xs">
          Reintentar
        </Button>
      )}
    </div>
  );
}
