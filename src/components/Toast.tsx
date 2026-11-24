import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertTriangleIcon, CheckIcon, InfoIcon, XIcon } from './icons';

type ToastTone = 'success' | 'danger' | 'info';

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TONE_CLASSES: Record<ToastTone, string> = {
  success: 'bg-tertiary-container text-on-tertiary-container',
  danger: 'bg-danger-container text-on-danger-container',
  info: 'bg-surface-container-highest text-on-surface',
};

const TONE_ICONS: Record<ToastTone, typeof CheckIcon> = {
  success: CheckIcon,
  danger: AlertTriangleIcon,
  info: InfoIcon,
};

const AUTO_DISMISS_MS = 4000;

// Entrada con fade + slide (150-250ms), respetando prefers-reduced-motion.
function ToastItemView({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const Icon = TONE_ICONS[toast.tone];
  return (
    <div
      role="status"
      className={`pointer-events-auto flex max-w-sm items-start gap-2 rounded-card border border-outline-variant/20 px-space-lg py-space-md text-body-sm shadow-raised transition duration-200 motion-reduce:transition-none ${TONE_CLASSES[toast.tone]} ${
        entered ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <p className="flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="flex-shrink-0 opacity-80 hover:opacity-100"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Notificaciones transitorias (ej. "Invitacion enviada", "No se pudo
 * eliminar al miembro") para las confirmaciones de exito que hoy no tienen
 * ninguna señal visual (Fase 5). Se montan en la raiz de la app
 * (ver main.tsx) y cualquier pantalla las dispara via useToast().
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, tone, message }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <ToastItemView key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return context;
}
